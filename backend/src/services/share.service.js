const shareRepository = require('../repositories/share.repository');
const collectionRepository = require('../repositories/collection.repository');
const crypto = require('crypto');

class ShareService {
  async createShare(userId, { collectionId, folderId, targetEmail, permission, type }) {
    // Nếu có folderId, ưu tiên kiểm tra quyền của folder
    if (folderId) {
      const folder = await require('../repositories/folder.repository').findByPk(folderId);
      if (!folder) throw new Error('Không tìm thấy thư mục');
      
      const collection = await collectionRepository.getById(folder.collection_id);
      if (collection.user_id && collection.user_id !== userId) {
        throw new Error('Bạn không có quyền chia sẻ thư mục này');
      }

      if (type === 'public') {
        const existingPublic = await shareRepository.findPublicByFolder(folderId);
        if (existingPublic) return existingPublic;
      }
    } else {
      // Check if collection exists
      const collection = await collectionRepository.getById(collectionId);
      if (!collection) {
        throw new Error('Không tìm thấy collection');
      }

      // Authorization
      if (collection.user_id && collection.user_id !== userId) {
        throw new Error('Bạn không có quyền chia sẻ collection này');
      }

      if (!collection.user_id) {
        await collectionRepository.update(collectionId, { user_id: userId });
      }

      if (type === 'public') {
        const existingPublic = await shareRepository.findPublicByCollection(collectionId);
        if (existingPublic) return existingPublic;
      }
    }

    let shareToken = null;
    if (type === 'public') {
      shareToken = crypto.randomBytes(20).toString('hex');
    } else {
      // Internal share check (legacy/unused for now but keeping logic)
      if (collectionId) {
        const existing = await shareRepository.findByCollectionAndEmail(collectionId, targetEmail);
        if (existing) throw new Error('Collection đã được chia sẻ với email này');
      }
    }

    return await shareRepository.create({
      collection_id: collectionId || null,
      folder_id: folderId || null,
      user_id: userId,
      target_email: targetEmail,
      permission,
      type,
      share_token: shareToken
    });
  }

  async getSharesByFolder(userId, folderId) {
    const folder = await require('../repositories/folder.repository').findByPk(folderId);
    if (!folder) throw new Error('Không tìm thấy thư mục');

    const collection = await collectionRepository.getById(folder.collection_id);
    if (collection.user_id && collection.user_id !== userId) {
      throw new Error('Bạn không có quyền xem thông tin chia sẻ của thư mục này');
    }

    return await shareRepository.findByFolderId(folderId);
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
    if (!share) {
      throw new Error('Mã chia sẻ không hợp lệ hoặc đã hết hạn');
    }

    // Nếu là chia sẻ Folder
    if (share.folder_id && share.folder) {
      const { Folder, Request, RequestExample } = require('../models');
      
      // Hàm helper để lấy đệ quy tất cả folder con và request
      const fetchFolderTree = async (parentFolderId) => {
        const folders = await Folder.findAll({
          where: { parent_id: parentFolderId },
          order: [['order', 'ASC'], ['created_at', 'ASC']],
          include: [
            { model: Request, as: 'requests', separate: true, order: [['order', 'ASC'], ['created_at', 'ASC']], include: [{ model: RequestExample, as: 'examples' }] }
          ]
        });

        const tree = [];
        for (const folder of folders) {
          const folderData = folder.get({ plain: true });
          folderData.folders = await fetchFolderTree(folder.id);
          tree.push(folderData);
        }
        return tree;
      };

      const subFolders = await fetchFolderTree(share.folder_id);
      
      return {
        id: share.folder.id,
        name: share.folder.name,
        isFolderShare: true,
        folders: subFolders,
        requests: share.folder.requests || []
      };
    }

    if (!share.collection) {
      throw new Error('Mã chia sẻ không hợp lệ hoặc đã hết hạn');
    }

    return share.collection;
  }
}

module.exports = new ShareService();
