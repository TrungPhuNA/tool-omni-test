const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { TestHistory } = require('../models');

class K6Service {
    constructor() {
        this.activeProcesses = new Map();
    }

    generateScript(config) {
        // config có thể là 1 request đơn lẻ hoặc 1 array các requests (Scenario)
        const isScenario = Array.isArray(config.requests);
        const requests = isScenario ? config.requests : [config];
        
        // Tìm API login để đưa vào setup()
        const loginReq = requests.find(r => r.isLogin);
        const otherReqs = requests.filter(r => !r.isLogin);

        let setupBlock = '';
        if (loginReq) {
            setupBlock = `
export function setup() {
  const res = http.request('${loginReq.method}', '${loginReq.url}', '${loginReq.body || ''}', {
    headers: ${JSON.stringify(loginReq.headers || {})}
  });
  const token = res.json('${loginReq.tokenPath || 'data.token'}');
  console.log('[SETUP] Login success, token extracted');
  return { token };
}
            `;
        }

        const script = `
import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  scenarios: {
    default: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2s', target: ${config.vus || 1} },
        { duration: '${config.duration || '10s'}', target: ${config.vus || 1} },
        { duration: '2s', target: 0 },
      ],
      gracefulRampDown: '1s',
      gracefulStop: '1s',
    },
  },
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<2000'],
  },
};

${setupBlock}

export default function (data) {
  const token = data ? data.token : null;

    ${requests.map((req, index) => {
      const method = req.method || 'GET';
      const url = req.url || '';
      const body = typeof req.body === 'object' ? JSON.stringify(req.body) : (req.body || '');
      const headers = req.headers || {};
      
      return `
  group('Step_${index + 1}_${(req.name || 'API').replace(/'/g, "\\'")}', function () {
    const params = {
      headers: ${JSON.stringify(headers)}
    };
    
    if (token) {
      params.headers['Authorization'] = \`Bearer \${token}\`;
    }

    const res = http.request('${method}', '${url}', ${body ? `\`${body.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`` : "''"}, params);
    
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 2000ms': (r) => r.timings.duration < 2000,
    });
  });`;
    }).join('\n  sleep(0.5);\n')}
  
  sleep(1);
}
        `;
        const scriptPath = path.join(__dirname, '../../temp_scripts', `test_${Date.now()}.js`);
        if (!fs.existsSync(path.join(__dirname, '../../temp_scripts'))) {
            fs.mkdirSync(path.join(__dirname, '../../temp_scripts'), { recursive: true });
        }
        fs.writeFileSync(scriptPath, script);
        return scriptPath;
    }

    runTest(testId, scriptPath, io, requestId = null, requests = null, passedScenarioName = null) {
        const k6Process = spawn('k6', ['run', scriptPath]);
        this.activeProcesses.set(testId, k6Process);

        let fullOutput = '';
        k6Process.stdout.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            io.emit('k6:progress', { testId, output });
        });

        k6Process.stderr.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            io.emit('k6:progress', { testId, output });
        });

        k6Process.on('error', (err) => {
            io.emit('k6:error', { testId, message: `Không thể khởi động k6: ${err.message}` });
            this.activeProcesses.delete(testId);
        });

        k6Process.on('close', async (code) => {
            const summary = this.parseSummary(fullOutput);
            
            // Xử lý tên hiển thị cho history
            let scenarioName = passedScenarioName;
            if (!scenarioName && requests && requests.length > 1) {
                scenarioName = requests.map(r => r.name || 'API').join(', ');
            }

            try {
                await TestHistory.create({
                    request_id: requestId,
                    type: 'load',
                    status: summary.errorRate > 50 ? 'fail' : 'pass',
                    duration: Math.round(summary.p95 || 0),
                    status_code: 200,
                    load_summary: {
                        ...summary,
                        isScenario: !!(requests && requests.length > 1),
                        scenarioName: scenarioName,
                        steps: requests ? requests.map(r => ({ name: r.name, method: r.method })) : []
                    },
                    response: { full_log: fullOutput.slice(-5000) }
                });
            } catch (dbErr) {
                console.error('Failed to save load test history:', dbErr);
            }

            io.emit('k6:done', { testId, code, summary });
            this.activeProcesses.delete(testId);
            if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        });

        return k6Process;
    }

    parseSummary(output) {
        // Regex để lấy các thông số cơ bản từ bảng k6 summary
        const p95Match = output.match(/http_req_duration\.*:.*p\(95\)=([\d.]+)/);
        const rpsMatch = output.match(/http_reqs\.*:.*([\d.]+)\/s/);
        const totalMatch = output.match(/http_reqs\.*:.*(\d+)\s/);
        const failedMatch = output.match(/http_req_failed\.*:.*([\d.]+)%/);
        const vusMatch = output.match(/vus\.*:.*(\d+)/);
        const iterationsMatch = output.match(/iterations\.*:.*(\d+)/);

        return {
            p95: p95Match ? parseFloat(p95Match[1]) : 0,
            rps: rpsMatch ? Math.round(parseFloat(rpsMatch[1])) : 0,
            http_reqs: totalMatch ? parseInt(totalMatch[1]) : 0,
            errorRate: failedMatch ? parseFloat(failedMatch[1]) : 0,
            vus: vusMatch ? parseInt(vusMatch[1]) : 0,
            iterations: iterationsMatch ? parseInt(iterationsMatch[1]) : 0
        };
    }

    stopTest(testId) {
        const process = this.activeProcesses.get(testId);
        if (process) {
            process.kill();
            this.activeProcesses.delete(testId);
            return true;
        }
        return false;
    }
}

module.exports = new K6Service();
