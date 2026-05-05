const environmentRepository = require('../repositories/environment.repository');

class EnvironmentService {
  async getAll() {
    return await environmentRepository.getAll();
  }

  async getById(id) {
    const environment = await environmentRepository.findById(id);
    if (!environment) {
      throw new Error('Không tìm thấy môi trường');
    }
    return environment;
  }

  async create(data) {
    return await environmentRepository.create(data);
  }

  async update(id, data) {
    const environment = await environmentRepository.update(id, data);
    if (!environment) {
      throw new Error('Không tìm thấy môi trường để cập nhật');
    }
    return environment;
  }

  async delete(id) {
    const deleted = await environmentRepository.delete(id);
    if (!deleted) {
      throw new Error('Không tìm thấy môi trường để xoá');
    }
    return true;
  }
}

module.exports = new EnvironmentService();
