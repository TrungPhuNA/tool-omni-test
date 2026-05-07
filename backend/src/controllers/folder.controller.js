const folderService = require('../services/folder.service');

class FolderController {
    async create(req, res, next) {
        try {
            const folder = await folderService.create(req.body);
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                data: folder
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const folder = await folderService.update(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: folder
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy thư mục để cập nhật') {
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
            await folderService.delete(req.params.id);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Xoá folder thành công'
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy thư mục để xoá') {
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
            await folderService.reorder(req.body.items);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Cập nhật thứ tự thư mục thành công'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FolderController();
