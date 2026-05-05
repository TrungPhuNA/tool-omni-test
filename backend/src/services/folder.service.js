const folderRepository = require('../repositories/folder.repository');

class FolderService {
  async create(data) {
    return await folderRepository.create(data);
  }

  async update(id, data) {
    const folder = await folderRepository.update(id, data);
    if (!folder) {
      throw new Error('Không tìm thấy thư mục để cập nhật');
    }
    return folder;
  }

  async delete(id) {
    const deleted = await folderRepository.delete(id);
    if (!deleted) {
      throw new Error('Không tìm thấy thư mục để xoá');
    }
    return true;
  }

  async getById(id) {
    const folder = await folderRepository.findByPk(id);
    if (!folder) {
      throw new Error('Không tìm thấy thư mục');
    }
    return folder;
  }
}

module.exports = new FolderService();
