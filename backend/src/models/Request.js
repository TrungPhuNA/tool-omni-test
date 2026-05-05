const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID tự tăng'
  },
  collection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK → collections.id'
  },
  folder_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên request, VD: "Login API", "Get User Profile"'
  },
  method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
    allowNull: false,
    comment: 'HTTP method'
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'URL đầy đủ hoặc có biến {{BASE_URL}}/path'
  },
  headers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Object chứa các header, VD: { Authorization: "Bearer {{token}}" }'
  },
  params: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Query params dạng key-value'
  },
  body: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Request body (chỉ dùng cho POST/PUT/PATCH)'
  },
  auth_config: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Cấu hình Auth Automator: { type, loginUrl, loginBody, tokenPath }'
  },
  assertions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Danh sách assertion rules: [{ type, op, expected }]'
  }
}, {
  tableName: 'requests',
  comment: 'Lưu từng API request đã cấu hình',
  timestamps: true,
  underscored: true
});

module.exports = Request;
