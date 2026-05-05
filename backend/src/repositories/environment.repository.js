const { Environment } = require('../models');

class EnvironmentRepository {
  async getAll() {
    return await Environment.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  async findById(id) {
    return await Environment.findByPk(id);
  }

  async create(data) {
    return await Environment.create(data);
  }

  async update(id, data) {
    const environment = await this.findById(id);
    if (!environment) return null;
    return await environment.update(data);
  }

  async delete(id) {
    const environment = await this.findById(id);
    if (!environment) return false;
    await environment.destroy();
    return true;
  }
}

module.exports = new EnvironmentRepository();
