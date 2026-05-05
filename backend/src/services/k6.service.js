const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class K6Service {
  constructor() {
    this.activeProcesses = new Map();
  }

  generateScript(config) {
    const { method, url, headers, body, vus, duration } = config;
    
    // Inject environment variables if any
    // For now assume absolute URL and resolved headers/body

    const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: ${vus || 10},
  duration: '${duration || '30s'}',
};

export default function () {
  const res = http.request('${method}', '${url}', '${body || ''}', {
    headers: ${JSON.stringify(headers || {})}
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
    const k6Process = spawn('k6', ['run', '--out', 'json=metrics.json', scriptPath]);
    this.activeProcesses.set(testId, k6Process);

    k6Process.stdout.on('data', (data) => {
      // k6 doesn't output much to stdout during run unless specified
      // We usually parse stderr for summaries or use a collector
      console.log(`k6 stdout: ${data}`);
    });

    k6Process.stderr.on('data', (data) => {
      const output = data.toString();
      // Simple parsing of k6 output to send progress to UI
      if (output.includes('vus=')) {
        io.emit('k6:progress', { testId, output });
      }
    });

    k6Process.on('close', (code) => {
      io.emit('k6:done', { testId, code });
      this.activeProcesses.delete(testId);
      // Clean up script
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
