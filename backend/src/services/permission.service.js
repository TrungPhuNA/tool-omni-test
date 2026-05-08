const { Collection, CollectionShare, Folder, Request } = require('../models');

class PermissionService {
  /**
   * Kiểm tra quyền ghi (sửa/xóa) đối với một Collection
   */
  async canWriteCollection(userId, userEmail, collectionId) {
    if (!collectionId) return false;

    // 1. Kiểm tra chủ sở hữu
    const collection = await Collection.findByPk(collectionId);
    if (!collection) return false;
    
    // Nếu collection không có owner (dữ liệu cũ) hoặc user là owner
    if (!collection.user_id || collection.user_id === userId) return true;

    // 2. Kiểm tra quyền được chia sẻ
    if (userEmail) {
      const share = await CollectionShare.findOne({
        where: {
          collection_id: collectionId,
          target_email: userEmail,
          permission: 'editor',
          type: 'internal'
        }
      });
      if (share) return true;
    }

    return false;
  }

  /**
   * Kiểm tra quyền ghi đối với Folder
   */
  async canWriteFolder(userId, userEmail, folderId) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) return false;
    return await this.canWriteCollection(userId, userEmail, folder.collection_id);
  }

  /**
   * Kiểm tra quyền ghi đối với Request
   */
  async canWriteRequest(userId, userEmail, requestId) {
    const request = await Request.findByPk(requestId);
    if (!request) return false;
    return await this.canWriteCollection(userId, userEmail, request.collection_id);
  }

  /**
   * Kiểm tra quyền ghi đối với Scenario
   */
  async canWriteScenario(userId, userEmail, scenarioId) {
    const { Scenario } = require('../models');
    const scenario = await Scenario.findByPk(scenarioId);
    if (!scenario) return false;
    return await this.canWriteCollection(userId, userEmail, scenario.collection_id);
  }

  /**
   * Kiểm tra quyền ghi đối với Example (Request Log)
   */
  async canWriteExample(userId, userEmail, exampleId) {
    const { RequestExample } = require('../models');
    const example = await RequestExample.findByPk(exampleId);
    if (!example) return false;
    return await this.canWriteRequest(userId, userEmail, example.request_id);
  }
}

module.exports = new PermissionService();
