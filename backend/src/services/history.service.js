const historyRepository = require('../repositories/history.repository');

class HistoryService {
  async getAll(filters = {}, limit = 50) {
    return await historyRepository.findAll(filters.requestId);
  }

  async getById(id) {
    const history = await historyRepository.findById(id);
    if (!history) throw new Error('Không tìm thấy lịch sử thử nghiệm');
    return history;
  }

  async create(data) {
    return await historyRepository.create(data);
  }

  async delete(id) {
    const deleted = await historyRepository.delete(id);
    if (!deleted) throw new Error('Không tìm thấy lịch sử để xoá');
    return true;
  }
}

module.exports = new HistoryService();
