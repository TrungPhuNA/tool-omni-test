const { TestHistory, Request } = require('../models');

class HistoryRepository {
  async create(data) {
    return await TestHistory.create(data);
  }

  async findAll(requestId) {
    const where = {};
    if (requestId) where.request_id = requestId;
    
    return await TestHistory.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 50,
      include: [{ model: Request, as: 'request', attributes: ['name', 'method', 'url'] }]
    });
  }

  async findById(id) {
    return await TestHistory.findByPk(id, {
      include: [{ model: Request, as: 'request' }]
    });
  }

  async delete(id) {
    const history = await TestHistory.findByPk(id);
    if (!history) return false;
    await history.destroy();
    return true;
  }

  async clearByRequestId(requestId) {
    return await TestHistory.destroy({ where: { request_id: requestId } });
  }
}

module.exports = new HistoryRepository();
