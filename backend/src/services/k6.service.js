const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { TestHistory } = require('../models');

class K6Service {
    constructor() {
        this.activeProcesses = new Map();
    }

    generateScript(config) {
        let { method, url, headers, body, vus, duration } = config;

        const safeHeaders = (headers && typeof headers === 'object' && !Array.isArray(headers)) 
            ? headers 
            : {};

        // Chuyển duration sang giây để tính toán stages
        const durSec = parseInt(duration) || 10;
        
        const script = `
import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '2s', target: ${vus || 1} },
    { duration: '${durSec}s', target: ${vus || 1} },
    { duration: '2s', target: 0 },
  ],
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<2000'],
  },
};

export default function () {
  group('API_Request_Execution', function () {
    const res = http.request('${method}', '${url}', '${body || ''}', {
      headers: ${JSON.stringify(safeHeaders)},
      timeout: '10s'
    });
    
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  });
  
  sleep(1);
}
    `;
        const scriptPath = path.join(__dirname, '../../temp_scripts', `test_${Date.now()}.js`);
        fs.writeFileSync(scriptPath, script);
        return scriptPath;
    }

    runTest(testId, scriptPath, io, requestId = null) {
        // Quay lại dùng k6 run trực tiếp để tránh lỗi socket trên macOS
        const k6Process = spawn('k6', ['run', scriptPath]);
        
        this.activeProcesses.set(testId, k6Process);

        let fullOutput = '';

        k6Process.stdout.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            console.log(`k6 stdout [${testId}]: ${output}`);
            io.emit('k6:progress', { testId, output });
        });

        k6Process.stderr.on('data', (data) => {
            const output = data.toString();
            fullOutput += output;
            console.log(`k6 stderr [${testId}]: ${output}`);
            io.emit('k6:progress', { testId, output });
        });

        k6Process.on('error', (err) => {
            console.error(`Failed to start k6 process: ${err.message}`);
            io.emit('k6:error', { testId, message: `Không thể khởi động k6: ${err.message}` });
            this.activeProcesses.delete(testId);
        });

        k6Process.on('close', async (code) => {
            console.log(`k6 process [${testId}] closed with code ${code}`);
            
            // Phân tích kết quả cơ bản từ log để lưu history
            const summary = this.parseSummary(fullOutput);
            
            try {
                await TestHistory.create({
                    request_id: requestId,
                    type: 'load',
                    status: summary.errorRate > 50 ? 'fail' : 'pass',
                    duration: Math.round(summary.p95 || 0),
                    status_code: 200, // Load test thường quan tâm summary hơn
                    load_summary: summary,
                    response: { full_log: fullOutput.slice(-5000) } // Lưu 5000 ký tự log cuối
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

        return {
            p95: p95Match ? parseFloat(p95Match[1]) : 0,
            rps: rpsMatch ? parseFloat(rpsMatch[1]) : 0,
            totalRequests: totalMatch ? parseInt(totalMatch[1]) : 0,
            errorRate: failedMatch ? parseFloat(failedMatch[1]) : 0
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
