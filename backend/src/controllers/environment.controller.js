const environmentService = require('../services/environment.service');

class EnvironmentController {
    async getAll(req, res, next) {
        try {
            const environments = await environmentService.getAll();
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: environments
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const environment = await environmentService.create(req.body);
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                data: environment
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const environment = await environmentService.update(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: environment
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy môi trường để cập nhật') {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: error.message
                });
            }
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await environmentService.delete(req.params.id);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Xoá môi trường thành công'
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy môi trường để xoá') {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new EnvironmentController();
