const collectionRepository = require('../repositories/collection.repository');

class CollectionService {
  async getAll(userId, userEmail) {
    return await collectionRepository.getAll(userId, userEmail);
  }

  async getById(id) {
    const collection = await collectionRepository.getById(id);
    if (!collection) {
      throw new Error('Không tìm thấy collection');
    }
    return collection;
  }

  async create(data) {
    return await collectionRepository.create(data);
  }

  async update(id, data) {
    const collection = await collectionRepository.update(id, data);
    if (!collection) {
      throw new Error('Không tìm thấy collection để cập nhật');
    }
    return collection;
  }

  async delete(id) {
    const deleted = await collectionRepository.delete(id);
    if (!deleted) {
      throw new Error('Không tìm thấy collection để xoá');
    }
    return true;
  }
}

module.exports = new CollectionService();
