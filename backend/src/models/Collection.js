const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID tự tăng'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên nhóm API, VD: "Auth Module", "Product API"'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mô tả mục đích của collection'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID của người dùng sở hữu collection này'
  }
}, {
  tableName: 'collections',
  comment: 'Nhóm các API request theo project/module',
  timestamps: true,
  underscored: true
});

module.exports = Collection;
