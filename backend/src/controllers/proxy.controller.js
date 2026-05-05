const proxyService = require('../services/proxy.service');
const { Environment } = require('../models');

class ProxyController {
  async execute(req, res, next) {
    try {
      let { method, url, headers, body, params, env_id } = req.body;
      
      // Load environment variables if env_id is provided
      let envVars = {};
      if (env_id) {
        const env = await Environment.findByPk(env_id);
        if (env && env.variables) {
          envVars = env.variables;
        }
      }
      
      // Inject variables into URL, headers, body, params
      url = proxyService.injectVariables(url, envVars);
      
      if (headers) {
        Object.keys(headers).forEach(key => {
          headers[key] = proxyService.injectVariables(headers[key], envVars);
        });
      }
      
      if (params) {
        Object.keys(params).forEach(key => {
          params[key] = proxyService.injectVariables(params[key], envVars);
        });
      }
      
      if (body && typeof body === 'object') {
        body = JSON.parse(proxyService.injectVariables(JSON.stringify(body), envVars));
      }

      const result = await proxyService.executeRequest({
        method,
        url,
        headers,
        body,
        params
      });

      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        message: 'Thực thi request thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProxyController();
