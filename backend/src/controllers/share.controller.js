const { Collection, CollectionShare, Folder, Request, RequestExample, Scenario, User } = require('../models');
const crypto = require('crypto');

/**
 * Create a new share for a collection
 */
exports.createShare = async (req, res) => {
  try {
    const { collectionId, targetEmail, permission, type } = req.body;
    const userId = req.user.id;

    // Check if collection exists
    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    // Authorization: If user_id is set, it must match. If null, auto-assign for legacy data.
    if (collection.user_id && collection.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!collection.user_id) {
      await collection.update({ user_id: userId });
    }

    let shareToken = null;
    if (type === 'public') {
      shareToken = crypto.randomBytes(20).toString('hex');
    }

    const share = await CollectionShare.create({
      collection_id: collectionId,
      user_id: userId,
      target_email: targetEmail,
      permission: permission || 'viewer',
      type: type || 'internal',
      share_token: shareToken
    });

    res.status(201).json({ success: true, data: share });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all shares for a collection
 */
exports.getShares = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user.id;

    // Check ownership
    const collection = await Collection.findOne({ where: { id: collectionId, user_id: userId } });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const shares = await CollectionShare.findAll({
      where: { collection_id: collectionId },
      include: [{ model: User, as: 'sharer', attributes: ['username', 'email'] }]
    });

    res.json({ success: true, data: shares });
  } catch (error) {
    console.error('Get shares error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a share
 */
exports.deleteShare = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const share = await CollectionShare.findByPk(id);
    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    // Check if user is the one who created the share or the collection owner
    const collection = await Collection.findByPk(share.collection_id);
    if (share.user_id !== userId && collection.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await share.destroy();
    res.json({ success: true, message: 'Share deleted successfully' });
  } catch (error) {
    console.error('Delete share error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get collection data via public token
 */
exports.getPublicCollection = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await CollectionShare.findOne({ 
      where: { share_token: token, type: 'public' } 
    });

    if (!share) {
      return res.status(404).json({ success: false, message: 'Public link invalid or expired' });
    }

    const collection = await Collection.findOne({
      where: { id: share.collection_id },
      include: [
        { 
          model: Folder, 
          as: 'folders',
          include: [{ model: Request, as: 'requests', include: [{ model: RequestExample, as: 'examples' }] }]
        },
        { 
          model: Request, 
          as: 'requests', 
          where: { folder_id: null },
          required: false,
          include: [{ model: RequestExample, as: 'examples' }] 
        },
        { model: Scenario, as: 'scenarios' }
      ]
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection no longer exists' });
    }

    res.json({ success: true, data: collection });
  } catch (error) {
    console.error('Get public collection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
