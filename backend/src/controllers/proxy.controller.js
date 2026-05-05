const proxyService = require('../services/proxy.service');
const { Environment } = require('../models');

class ProxyController {
  async execute(req, res, next) {
    try {
      const { method, url, headers, body, params, authConfig, variables } = req.body;
      
      const result = await proxyService.executeRequest({
        method,
        url,
        headers,
        body,
        params,
        authConfig,
        variables
      });

      // Lưu vào lịch sử (Background - không chặn response trả về cho user)
      const { TestHistory } = require('../models');
      TestHistory.create({
        request_id: req.body.requestId || null,
        type: 'functional',
        status: result.statusCode < 400 ? 'pass' : 'fail',
        duration: result.responseTime,
        status_code: result.statusCode,
        response: result.body,
        assert_result: null // Sẽ bổ sung sau khi có logic assertion
      }).catch(err => console.error('Lỗi lưu lịch sử:', err));

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
