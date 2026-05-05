const exampleRepo = require('../repositories/example.repository');

class ExampleController {
    async getByRequest(req, res, next) {
        try {
            const examples = await exampleRepo.getByRequestId(req.params.requestId);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: examples
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const example = await exampleRepo.create(req.body);
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Đã lưu snapshot thành công',
                data: example
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const example = await exampleRepo.update(req.params.id, req.body);
            if (!example) {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy snapshot'
                });
            }
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Đã cập nhật snapshot',
                data: example
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const deleted = await exampleRepo.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: 'Không tìm thấy snapshot'
                });
            }
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Đã xóa snapshot'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ExampleController();
