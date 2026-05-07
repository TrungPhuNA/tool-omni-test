const { Request } = require('../models');

class RequestRepository {
  async getByCollectionId(collectionId) {
    return await Request.findAll({
      where: { collection_id: collectionId },
      order: [['order', 'ASC'], ['created_at', 'ASC']]
    });
  }

  async getById(id) {
    return await Request.findByPk(id);
  }

  async create(data) {
    return await Request.create(data);
  }

  async update(id, data) {
    await Request.update(data, {
      where: { id }
    });
    return await Request.findByPk(id);
  }

  async delete(id) {
    const request = await Request.findByPk(id);
    if (!request) return false;
    await request.destroy();
    return true;
  }
}

module.exports = new RequestRepository();
