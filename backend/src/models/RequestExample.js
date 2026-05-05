const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RequestExample = sequelize.define('RequestExample', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK → requests.id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên log/example do người dùng đặt'
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  headers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  params: {
    type: DataTypes.JSON,
    allowNull: true
  },
  body: {
    type: DataTypes.JSON,
    allowNull: true
  },
  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  response_body: {
    type: DataTypes.JSON,
    allowNull: true
  },
  response_headers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  response_time: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'request_examples',
  comment: 'Lưu các snapshot/example của một request',
  timestamps: true,
  underscored: true
});

module.exports = RequestExample;
