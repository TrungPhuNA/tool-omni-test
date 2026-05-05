const { User } = require('../models');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, userData) {
    const user = await this.findById(id);
    if (!user) return null;
    return await user.update(userData);
  }
}

module.exports = new UserRepository();
