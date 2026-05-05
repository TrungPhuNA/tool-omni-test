const shareRepository = require('../repositories/share.repository');
const collectionRepository = require('../repositories/collection.repository');
const crypto = require('crypto');

class ShareService {
  async createShare(userId, { collectionId, targetEmail, permission, type }) {
    // Check if collection exists
    const collection = await collectionRepository.getById(collectionId);
    if (!collection) {
      throw new Error('Không tìm thấy collection');
    }

    // Authorization: If user_id is set, it must match. If null, auto-assign for legacy data.
    if (collection.user_id && collection.user_id !== userId) {
      throw new Error('Bạn không có quyền chia sẻ collection này');
    }

    if (!collection.user_id) {
      await collectionRepository.update(collectionId, { user_id: userId });
    }

    let shareToken = null;
    if (type === 'public') {
      // Check if already has a public share
      const existingPublic = await shareRepository.findPublicByCollection(collectionId);
      if (existingPublic) return existingPublic;
      
      shareToken = crypto.randomBytes(20).toString('hex');
    } else {
      // Internal share check
      const existing = await shareRepository.findByCollectionAndEmail(collectionId, targetEmail);
      if (existing) {
        throw new Error('Collection đã được chia sẻ với email này');
      }
    }

    return await shareRepository.create({
      collection_id: collectionId,
      user_id: userId,
      target_email: targetEmail,
      permission,
      type,
      share_token: shareToken
    });
  }

  async getShares(userId, collectionId) {
    const collection = await collectionRepository.getById(collectionId);
    if (!collection) {
      throw new Error('Không tìm thấy collection');
    }

    if (collection.user_id && collection.user_id !== userId) {
      throw new Error('Bạn không có quyền xem thông tin chia sẻ của collection này');
    }

    return await shareRepository.findByCollectionId(collectionId);
  }

  async deleteShare(userId, shareId) {
    const share = await shareRepository.findById(shareId);
    if (!share) {
      throw new Error('Không tìm thấy thông tin chia sẻ');
    }

    if (share.user_id !== userId) {
      throw new Error('Bạn không có quyền xoá thông tin chia sẻ này');
    }

    return await shareRepository.delete(shareId);
  }

  async getPublicCollection(token) {
    const share = await shareRepository.findPublicByToken(token);
    if (!share || !share.collection) {
      throw new Error('Mã chia sẻ không hợp lệ hoặc đã hết hạn');
    }
    return share.collection;
  }
}

module.exports = new ShareService();
