const axios = require('axios');
const authAutomator = require('./auth_automator.service');

class ProxyService {
  async executeRequest(config) {
    let { method, url, headers = {}, body = {}, params = {}, authConfig } = config;
    
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
      
      return {
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.data,
        responseTime,
        size: JSON.stringify(response.data).length // Ước tính size
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        statusCode: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        headers: error.response?.headers || {},
        body: error.response?.data || { message: error.message },
        responseTime: endTime - startTime,
        error: error.message
      };
    }
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
