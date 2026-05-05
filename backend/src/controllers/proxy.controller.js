const proxyService = require('../services/proxy.service');

class ProxyController {
    async execute(req, res, next) {
        try {
            const { method, url, headers, body, params, authConfig, variables, requestId, preScript, postScript } = req.body;

            const result = await proxyService.executeRequest({
                method,
                url,
                headers,
                body,
                params,
                authConfig,
                variables,
                requestId,
                preScript,
                postScript
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
