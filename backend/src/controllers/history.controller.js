const historyService = require('../services/history.service');

class HistoryController {
  async getAll(req, res, next) {
    try {
      const { requestId, limit } = req.query;
      const history = await historyService.getAll({ requestId }, limit);

      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const history = await historyService.getById(req.params.id);
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        data: history
      });
    } catch (error) {
      if (error.message === 'Không tìm thấy lịch sử thử nghiệm') {
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
      await historyService.delete(req.params.id);
      res.status(200).json({
        status: 'success',
        code: 'SUCCESS',
        message: 'Xoá lịch sử thành công'
      });
    } catch (error) {
      if (error.message === 'Không tìm thấy lịch sử để xoá') {
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

module.exports = new HistoryController();
