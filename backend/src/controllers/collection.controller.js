const collectionRepo = require('../repositories/collection.repository');

class CollectionController {
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            const userEmail = req.user.email;
            const collections = await collectionRepo.getAll(userId, userEmail);
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
            const collection = await collectionRepo.create(data);
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
            const collection = await collectionRepo.update(req.params.id, req.body);
            if (!collection) {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy collection'
                });
            }
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: collection
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const deleted = await collectionRepo.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy collection'
                });
            }
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Xoá collection thành công'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CollectionController();
