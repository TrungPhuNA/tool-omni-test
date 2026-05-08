const permissionService = require('../services/permission.service');

/**
 * Middleware kiểm tra quyền ghi (Editor) cho các hành động thay đổi dữ liệu
 * @param {string} resourceType - 'collection', 'folder', 'request'
 */
const checkEditorPermission = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      let hasPermission = false;

      // Lấy resource ID từ params hoặc body tùy trường hợp
      const resourceId = req.params.id;

      if (resourceType === 'collection') {
        const collectionId = resourceId || req.body.collection_id;
        hasPermission = await permissionService.canWriteCollection(userId, userEmail, collectionId);
      } 
      else if (resourceType === 'folder') {
        if (req.method === 'POST') {
          // Tạo folder mới -> check quyền của collection cha
          const collectionId = req.body.collection_id;
          hasPermission = await permissionService.canWriteCollection(userId, userEmail, collectionId);
        } else {
          // Sửa/Xóa folder -> check chính nó
          hasPermission = await permissionService.canWriteFolder(userId, userEmail, resourceId);
        }
      } 
      else if (resourceType === 'request') {
        if (req.method === 'POST' && !resourceId) {
          // Tạo request mới -> check quyền của collection cha
          const collectionId = req.body.collection_id;
          hasPermission = await permissionService.canWriteCollection(userId, userEmail, collectionId);
        } else {
          // Sửa/Xóa request -> check chính nó
          hasPermission = await permissionService.canWriteRequest(userId, userEmail, resourceId);
        }
      } 
      else if (resourceType === 'scenario') {
        if (req.method === 'POST' && !resourceId) {
          const collectionId = req.body.collection_id;
          hasPermission = await permissionService.canWriteCollection(userId, userEmail, collectionId);
        } else {
          hasPermission = await permissionService.canWriteScenario(userId, userEmail, resourceId);
        }
      }
      else if (resourceType === 'example') {
        if (req.method === 'POST' && !resourceId) {
          const requestId = req.body.request_id;
          hasPermission = await permissionService.canWriteRequest(userId, userEmail, requestId);
        } else {
          hasPermission = await permissionService.canWriteExample(userId, userEmail, resourceId);
        }
      }

      if (!hasPermission) {
        return res.status(403).json({
          status: 'error',
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền thực hiện hành động này (Chế độ chỉ xem)'
        });
      }

      next();
    } catch (error) {
      console.error('[Permission Middleware Error]', error);
      next(error);
    }
  };
};

module.exports = { checkEditorPermission };
