const collectionService = require('../services/collection.service');

class CollectionController {
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            const userEmail = req.user.email;
            const collections = await collectionService.getAll(userId, userEmail);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: collections
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = { ...req.body, user_id: req.user.id };
            const collection = await collectionService.create(data);
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Tạo collection thành công',
                data: collection
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const collection = await collectionService.update(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: collection
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy collection để cập nhật') {
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
            await collectionService.delete(req.params.id);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Xoá collection thành công'
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy collection để xoá') {
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

module.exports = new CollectionController();
