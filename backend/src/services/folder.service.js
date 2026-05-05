const folderRepo = require('../repositories/folder.repository');

class FolderService {
  async createFolder(data) {
    return await folderRepo.create(data);
  }

  async updateFolder(id, data) {
    return await folderRepo.update(id, data);
  }

  async deleteFolder(id) {
    return await folderRepo.delete(id);
  }
}

module.exports = new FolderService();
