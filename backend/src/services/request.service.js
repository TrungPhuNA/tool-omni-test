const requestRepository = require('../repositories/request.repository');

class RequestService {
  async getByCollectionId(collectionId) {
    return await requestRepository.getByCollectionId(collectionId);
  }

  async getById(id) {
    const request = await requestRepository.getById(id);
    if (!request) {
      throw new Error('Không tìm thấy request');
    }
    return request;
  }

  async create(data) {
    return await requestRepository.create(data);
  }

  async update(id, data) {
    const request = await requestRepository.update(id, data);
    if (!request) {
      throw new Error('Không tìm thấy request để cập nhật');
    }
    return request;
  }

  async delete(id) {
    const deleted = await requestRepository.delete(id);
    if (!deleted) {
      throw new Error('Không tìm thấy request để xoá');
    }
    return true;
  }

  async reorder(items) {
    if (!Array.isArray(items)) return false;
    for (const item of items) {
      await requestRepository.update(item.id, { order: item.order });
    }
    return true;
  }
}

module.exports = new RequestService();
