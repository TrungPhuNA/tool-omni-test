const { Collection, Request, Scenario, Folder, RequestExample } = require('../models');

class CollectionRepository {
  async getAll() {
    return await Collection.findAll({
      include: [
        { 
          model: Folder, 
          as: 'folders',
          include: [
            { 
              model: Request, 
              as: 'requests',
              include: [{ model: RequestExample, as: 'examples' }]
            }
          ]
        },
        { 
          model: Request, 
          as: 'requests',
          include: [{ model: RequestExample, as: 'examples' }]
        },
        { model: Scenario, as: 'scenarios' }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getById(id) {
    return await Collection.findByPk(id, {
      include: [
        { 
          model: Folder, 
          as: 'folders',
          include: [
            { 
              model: Request, 
              as: 'requests',
              include: [{ model: RequestExample, as: 'examples' }]
            }
          ]
        },
        { 
          model: Request, 
          as: 'requests',
          include: [{ model: RequestExample, as: 'examples' }]
        },
        { model: Scenario, as: 'scenarios' }
      ]
    });
  }

  async create(data) {
    return await Collection.create(data);
  }

  async update(id, data) {
    const collection = await Collection.findByPk(id);
    if (!collection) return null;
    return await collection.update(data);
  }

  async delete(id) {
    const collection = await Collection.findByPk(id);
    if (!collection) return false;
    await collection.destroy();
    return true;
  }
}

module.exports = new CollectionRepository();
