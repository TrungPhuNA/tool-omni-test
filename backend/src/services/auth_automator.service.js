const axios = require('axios');
const _ = require('lodash');

class AuthAutomatorService {
  /**
   * Tự động lấy token từ API Login
   * @param {Object} config { loginUrl, loginMethod, loginHeaders, loginBody, tokenPath }
   */
  async fetchToken(config) {
    const { 
      loginUrl, 
      loginMethod = 'POST', 
      loginHeaders = { 'Content-Type': 'application/json' }, 
      loginBody = {}, 
      tokenPath = 'token' 
    } = config;

    if (!loginUrl) return null;

    try {
      const response = await axios({
        method: loginMethod,
        url: loginUrl,
        headers: loginHeaders,
        data: loginBody,
        timeout: 10000
      });

      // Lấy token từ response theo path (VD: data.access_token)
      const token = _.get(response.data, tokenPath);
      return token;
    } catch (error) {
      console.error('AuthAutomator Error:', error.message);
      throw new Error(`AuthAutomator failed: ${error.message}`);
    }
  }
}

module.exports = new AuthAutomatorService();
