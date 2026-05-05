const { RequestExample } = require('../models');

class ExampleRepository {
    async getByRequestId(requestId) {
        return await RequestExample.findAll({
            where: { request_id: requestId },
            order: [['created_at', 'DESC']]
        });
    }

    async create(data) {
        return await RequestExample.create(data);
    }

    async update(id, data) {
        const example = await RequestExample.findByPk(id);
        if (!example) return null;
        return await example.update(data);
    }

    async delete(id) {
        const example = await RequestExample.findByPk(id);
        if (!example) return false;
        await example.destroy();
        return true;
    }
}

module.exports = new ExampleRepository();
