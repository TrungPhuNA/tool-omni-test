const { Scenario } = require('../models');

class ScenarioRepository {
    async findAll() {
        return await Scenario.findAll({
            order: [['created_at', 'DESC']]
        });
    }

    async findByCollectionId(collectionId) {
        return await Scenario.findAll({
            where: { collection_id: collectionId },
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id) {
        return await Scenario.findByPk(id);
    }

    async create(data) {
        return await Scenario.create(data);
    }

    async update(id, data) {
        const scenario = await this.findById(id);
        if (!scenario) return null;
        return await scenario.update(data);
    }

    async delete(id) {
        const scenario = await this.findById(id);
        if (!scenario) return false;
        await scenario.destroy();
        return true;
    }
}

module.exports = new ScenarioRepository();
