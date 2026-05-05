const { Folder, Request } = require('../models');

class FolderRepository {
  async create(data) {
    return await Folder.create(data);
  }

  async findByPk(id) {
    return await Folder.findByPk(id);
  }

  async update(id, data) {
    const folder = await Folder.findByPk(id);
    if (!folder) return null;
    return await folder.update(data);
  }

  async delete(id) {
    const folder = await Folder.findByPk(id);
    if (!folder) return false;
    
    // Mồ côi hóa các requests trong folder này
    await Request.update({ folder_id: null }, { where: { folder_id: id } });
    
    await folder.destroy();
    return true;
  }
}

module.exports = new FolderRepository();
