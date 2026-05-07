const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CollectionShare = sequelize.define('CollectionShare', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  collection_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  folder_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID của folder nếu chia sẻ ở cấp độ folder'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'The user who shared this collection'
  },
  target_email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Email of the user this collection is shared with (for internal sharing)'
  },
  share_token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    comment: 'Unique token for public sharing link'
  },
  permission: {
    type: DataTypes.ENUM('viewer', 'editor'),
    defaultValue: 'viewer',
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('internal', 'public'),
    defaultValue: 'internal',
    allowNull: false
  }
}, {
  tableName: 'collection_shares',
  timestamps: true,
  underscored: true
});

module.exports = CollectionShare;
