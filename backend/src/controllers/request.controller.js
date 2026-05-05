const requestRepo = require('../repositories/request.repository');

class RequestController {
  async getByCollectionId(req, res, next) {
    try {
      const requests = await requestRepo.getByCollectionId(req.params.collectionId);
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
      const request = await requestRepo.create(req.body);
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
      const request = await requestRepo.update(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({
          status: 'fail',
          code: 'NOT_FOUND',
          message: 'Không tìm thấy request'
        });
      }
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await requestRepo.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          status: 'fail',
          code: 'NOT_FOUND',
          message: 'Không tìm thấy request'
        });
      }
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        message: 'Xoá request thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RequestController();
