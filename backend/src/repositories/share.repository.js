const { CollectionShare, Collection, User } = require('../models');

class ShareRepository {
  async findPublicByToken(token) {
    return await CollectionShare.findOne({
      where: { share_token: token, type: 'public' },
      include: [
        {
          model: Collection,
          as: 'collection',
          include: [
            { model: require('../models').Folder, as: 'folders', include: [{ model: require('../models').Request, as: 'requests', include: [{ model: require('../models').RequestExample, as: 'examples' }] }] },
            { model: require('../models').Request, as: 'requests', where: { folder_id: null }, required: false, include: [{ model: require('../models').RequestExample, as: 'examples' }] }
          ]
        }
      ]
    });
  }

  async findByCollectionAndEmail(collectionId, targetEmail) {
    return await CollectionShare.findOne({
      where: { collection_id: collectionId, target_email: targetEmail }
    });
  }

  async findByCollectionId(collectionId) {
    const { User } = require('../models');
    return await CollectionShare.findAll({
      where: { collection_id: collectionId },
      include: [{ model: User, as: 'sharer', attributes: ['username', 'email'] }]
    });
  }

  async findPublicByCollection(collectionId) {
    return await CollectionShare.findOne({
      where: { collection_id: collectionId, type: 'public' }
    });
  }

  async create(data) {
    return await CollectionShare.create(data);
  }

  async delete(id) {
    const share = await CollectionShare.findByPk(id);
    if (!share) return false;
    await share.destroy();
    return true;
  }

  async findById(id) {
    return await CollectionShare.findByPk(id);
  }

  async update(id, data) {
    const share = await this.findById(id);
    if (!share) return null;
    return await share.update(data);
  }
}

module.exports = new ShareRepository();
