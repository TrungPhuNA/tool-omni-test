const { Op } = require('sequelize');
const { Collection, Folder, Request, RequestExample, Scenario, CollectionShare } = require('../models');

class CollectionRepository {
  async getAll(userId, userEmail) {

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

    const results = await Collection.findAll({
      where: whereClause,
      include: [
        { 
          model: Folder, 
          as: 'folders',
          separate: true,
          order: [['order', 'ASC']],
          include: [
            { 
              model: Request, 
              as: 'requests',
              separate: true,
              order: [['order', 'ASC']],
              include: [{ model: RequestExample, as: 'examples' }]
            }
          ]
        },
        { 
          model: Request, 
          as: 'requests',
          where: { folder_id: null },
          required: false,
          separate: true,
          order: [['order', 'ASC']],
          include: [{ model: RequestExample, as: 'examples' }]
        },
        { model: Scenario, as: 'scenarios' },
        { model: CollectionShare, as: 'shares' }
      ],
      order: [['created_at', 'DESC']]
    });

    return results;
  }

  async getById(id) {
    return await Collection.findByPk(id, {
      include: [
        { 
          model: Folder, 
          as: 'folders',
          separate: true,
          order: [['order', 'ASC']],
          include: [
            { 
              model: Request, 
              as: 'requests',
              separate: true,
              order: [['order', 'ASC']],
              include: [{ model: RequestExample, as: 'examples' }]
            }
          ]
        },
        { 
          model: Request, 
          as: 'requests',
          where: { folder_id: null },
          required: false,
          separate: true,
          order: [['order', 'ASC']],
          include: [{ model: RequestExample, as: 'examples' }]
        },
        { model: Scenario, as: 'scenarios' },
        { model: CollectionShare, as: 'shares' }
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
