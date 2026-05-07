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
    comment: 'Object chứa các header, VD: { Authorization: "Bearer {{token}}" }',
    get() {
      const rawValue = this.getDataValue('headers');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue || [];
    },
    set(value) {
      this.setDataValue('headers', typeof value === 'string' ? JSON.parse(value) : value);
    }
  },
  params: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Query params dạng key-value',
    get() {
      const rawValue = this.getDataValue('params');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue || [];
    },
    set(value) {
      this.setDataValue('params', typeof value === 'string' ? JSON.parse(value) : value);
    }
  },
  body: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Request body (chỉ dùng cho POST/PUT/PATCH)',
    get() {
      const rawValue = this.getDataValue('body');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue;
    },
    set(value) {
      this.setDataValue('body', typeof value === 'string' ? JSON.parse(value) : value);
    }
  },
  authConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'auth_config',
    comment: 'Cấu hình Auth Automator: { type, loginUrl, loginBody, tokenPath }',
    get() {
      const rawValue = this.getDataValue('authConfig');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue || { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' };
    },
    set(value) {
      this.setDataValue('authConfig', typeof value === 'string' ? JSON.parse(value) : value);
    }
  },
  assertions: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'assertions',
    comment: 'Danh sách assertion rules: [{ type, op, expected }]',
    get() {
      const rawValue = this.getDataValue('assertions');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue || [];
    },
    set(value) {
      this.setDataValue('assertions', typeof value === 'string' ? JSON.parse(value) : value);
    }
  },
  preScript: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'pre_script',
    comment: 'Javascript chạy trước khi gửi request'
  },
  postScript: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'post_script',
    comment: 'Javascript chạy sau khi nhận kết quả'
  }
}, {
  tableName: 'requests',
  comment: 'Lưu từng API request đã cấu hình',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Request;
