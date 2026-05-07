const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  collection_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID của thư mục cha (cho lồng nhau)'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'folders',
  timestamps: false
});

module.exports = Folder;
