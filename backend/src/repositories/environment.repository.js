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

        // Ép Sequelize nhận diện sự thay đổi của JSON field
        if (data.variables) {
            environment.set('variables', data.variables);
            environment.changed('variables', true);
        }

        // Cập nhật các trường khác nếu có (ví dụ: name)
        if (data.name) environment.name = data.name;

        return await environment.save();
    }

    async delete(id) {
        const environment = await this.findById(id);
        if (!environment) return false;
        await environment.destroy();
        return true;
    }
}

module.exports = new EnvironmentRepository();
