const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class K6Service {
    constructor() {
        this.activeProcesses = new Map();
    }

    generateScript(config) {
        let { method, url, headers, body, vus, duration } = config;

        // Backend không tự ý gắn URL nữa, để Frontend xử lý theo Environment

        // Đảm bảo headers là object
        const safeHeaders = (headers && typeof headers === 'object' && !Array.isArray(headers)) 
            ? headers 
            : {};

        const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: ${vus || 1},
  duration: '${duration || '10s'}',
};

export default function () {
  const res = http.request('${method}', '${url}', '${body || ''}', {
    headers: ${JSON.stringify(safeHeaders)}
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
    `;
        const scriptPath = path.join(__dirname, '../../temp_scripts', `test_${Date.now()}.js`);
        fs.writeFileSync(scriptPath, script);
        return scriptPath;
    }

    runTest(testId, scriptPath, io) {
        const k6Process = spawn('k6', ['run', scriptPath]);
        this.activeProcesses.set(testId, k6Process);

        k6Process.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`k6 stdout [${testId}]: ${output}`);
            io.emit('k6:progress', { testId, output });
        });

        k6Process.stderr.on('data', (data) => {
            const output = data.toString();
            console.log(`k6 stderr [${testId}]: ${output}`);
            io.emit('k6:progress', { testId, output });
        });

        k6Process.on('error', (err) => {
            console.error(`Failed to start k6 process: ${err.message}`);
            io.emit('k6:error', { testId, message: `Không thể khởi động k6: ${err.message}` });
            this.activeProcesses.delete(testId);
        });

        k6Process.on('close', (code) => {
            console.log(`k6 process [${testId}] closed with code ${code}`);
            io.emit('k6:done', { testId, code });
            this.activeProcesses.delete(testId);
            if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
        });

        return k6Process;
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
