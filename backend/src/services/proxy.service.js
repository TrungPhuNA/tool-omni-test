const axios = require('axios');
const authAutomator = require('./auth_automator.service');
const historyRepository = require('../repositories/history.repository');
const vm = require('vm');

class ProxyService {
  async executeRequest(config) {
    let { method, url, headers = {}, body = {}, params = {}, authConfig, variables = {}, requestId = null, preScript = '', postScript = '' } = config;
    const scriptLogs = [];
    
    // 0. Chạy Pre-request Script
    if (preScript) {
      variables = this.runScript(preScript, { 
        request: { method, url, headers, body, params },
        variables 
      }, scriptLogs);
    }

    // 1. Inject biến môi trường vào URL, Headers, Body, Params
    url = this.injectVariables(url, variables);
    
    // Inject vào headers
    Object.keys(headers).forEach(key => {
      headers[key] = this.injectVariables(headers[key], variables);
    });

    // Inject vào params
    Object.keys(params).forEach(key => {
      params[key] = this.injectVariables(params[key], variables);
    });

    // Inject vào body nếu là string (JSON) hoặc object
    if (typeof body === 'string') {
      body = this.injectVariables(body, variables);
    } else if (typeof body === 'object') {
      const bodyStr = JSON.stringify(body);
      const injectedBodyStr = this.injectVariables(bodyStr, variables);
      try {
        body = JSON.parse(injectedBodyStr);
      } catch (e) {
        body = injectedBodyStr;
      }
    }

    // 1. Xử lý Auth Automator nếu có
    if (authConfig && authConfig.enabled && authConfig.loginUrl) {
      try {
        const token = await authAutomator.fetchToken(authConfig);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Auth Automator failed, proceeding without auto-token:', err.message);
      }
    }

    const startTime = Date.now();
    let result;
    try {
      const response = await axios({
        method,
        url,
        headers,
        data: ['GET', 'DELETE'].includes(method.toUpperCase()) ? undefined : body,
        params,
        timeout: 30000, // 30s timeout
        validateStatus: () => true // Nhận tất cả status code để tester tự check
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      result = {
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.data,
        responseTime,
        size: JSON.stringify(response.data).length // Ước tính size
      };
    } catch (error) {
      const endTime = Date.now();
      result = {
        statusCode: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        headers: error.response?.headers || {},
        body: error.response?.data || { message: error.message },
        responseTime: endTime - startTime,
        error: error.message
      };
    }

    // 2. Chạy Post-response Script
    if (postScript) {
      variables = this.runScript(postScript, {
        request: { method, url, headers, body, params },
        response: result,
        variables
      }, scriptLogs);
    }

    // 3. Lưu lịch sử (Background - không chặn response trả về cho user)
    // Dùng repository thay vì gọi model trực tiếp ở đây
    historyRepository.create({
      request_id: requestId,
      type: 'functional',
      status: result.statusCode < 400 ? 'pass' : 'fail',
      duration: result.responseTime,
      status_code: result.statusCode,
      response: result.body,
      assert_result: null
    }).catch(err => console.error('Lỗi lưu lịch sử:', err));

    return { ...result, variables, scriptLogs };
  }

  // Chạy script trong sandbox
  runScript(script, context, scriptLogs = []) {
    const CryptoJS = require('crypto-js');
    const vars = { ...context.variables };
    const omni = {
      env: {
        set: (key, value) => { vars[key] = value; },
        get: (key) => vars[key]
      },
      environment: {
        set: (key, value) => { vars[key] = value; },
        get: (key) => vars[key]
      },
      request: context.request,
      response: context.response ? {
        ...context.response,
        json: () => {
          try {
            return typeof context.response.body === 'string' 
              ? JSON.parse(context.response.body) 
              : context.response.body;
          } catch (e) {
            return null;
          }
        }
      } : null,
      log: (...args) => {
        const logMsg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
        scriptLogs.push(logMsg);
        console.log('[Script Log]', logMsg);
      }
    };

    const sandbox = {
      omni: omni,
      pm: omni, // Alias giống Postman
      CryptoJS: CryptoJS, // Tích hợp thư viện crypto
      console: { log: omni.log }
    };

    try {
      vm.createContext(sandbox);
      vm.runInContext(script, sandbox, { timeout: 1000 });
    } catch (err) {
      const errMsg = `Script Error: ${err.message}`;
      scriptLogs.push(errMsg);
      console.error(errMsg);
    }

    return vars;
  }

  // Inject biến môi trường vào string
  injectVariables(target, variables = {}) {
    if (typeof target !== 'string') return target;
    
    let result = target;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }
}

module.exports = new ProxyService();
