const { Op } = require('sequelize');

class CollectionRepository {
  async getAll(userId, userEmail) {
    const models = require('../models');
    const { Collection, Folder, Request, RequestExample, Scenario, CollectionShare } = models;

    // Find collections shared with this user's email
    let sharedCollectionIds = [];
    if (userEmail) {
      const shares = await CollectionShare.findAll({
        where: { target_email: userEmail, type: 'internal' },
        attributes: ['collection_id']
      });
      sharedCollectionIds = shares.map(s => s.collection_id);
    }

    const whereClause = {};
    if (userId) {
      whereClause[Op.or] = [
        { user_id: userId },
        { user_id: null }, // Support legacy data that has no owner yet
        { id: { [Op.in]: sharedCollectionIds } }
      ];
    }

    return await Collection.findAll({
      where: whereClause,
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
          where: { folder_id: null },
          required: false,
          include: [{ model: RequestExample, as: 'examples' }]
        },
        { model: Scenario, as: 'scenarios' },
        { model: CollectionShare, as: 'shares' }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getById(id) {
    const models = require('../models');
    const { Collection, Folder, Request, RequestExample, Scenario, CollectionShare } = models;

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
          where: { folder_id: null },
          required: false,
          include: [{ model: RequestExample, as: 'examples' }]
        },
        { model: Scenario, as: 'scenarios' },
        { model: CollectionShare, as: 'shares' }
      ]
    });
  }

  async create(data) {
    const { Collection } = require('../models');
    return await Collection.create(data);
  }

  async update(id, data) {
    const { Collection } = require('../models');
    const collection = await Collection.findByPk(id);
    if (!collection) return null;
    return await collection.update(data);
  }

  async delete(id) {
    const { Collection } = require('../models');
    const collection = await Collection.findByPk(id);
    if (!collection) return false;
    await collection.destroy();
    return true;
  }
}

module.exports = new CollectionRepository();
