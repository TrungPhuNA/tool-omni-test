const folderService = require('../services/folder.service');

class FolderController {
  async create(req, res, next) {
    try {
      const folder = await folderService.createFolder(req.body);
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
      const folder = await folderService.updateFolder(req.params.id, req.body);
      if (!folder) {
        return res.status(404).json({
          status: 'fail',
          code: 'NOT_FOUND',
          message: 'Folder không tồn tại'
        });
      }
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        data: folder
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await folderService.deleteFolder(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          code: 'NOT_FOUND',
          message: 'Folder không tồn tại'
        });
      }
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        message: 'Xoá folder thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FolderController();
