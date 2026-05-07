const requestService = require('../services/request.service');

class RequestController {
    async getByCollectionId(req, res, next) {
        try {
            const requests = await requestService.getByCollectionId(req.params.collectionId);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: requests
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const request = await requestService.create(req.body);
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Tạo request thành công',
                data: request
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const request = await requestService.update(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: request
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy request để cập nhật') {
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
            await requestService.delete(req.params.id);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Xoá request thành công'
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy request để xoá') {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: error.message
                });
            }
            next(error);
        }
    }

    async reorder(req, res, next) {
        try {
            await requestService.reorder(req.body.items);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Cập nhật thứ tự API thành công'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RequestController();
