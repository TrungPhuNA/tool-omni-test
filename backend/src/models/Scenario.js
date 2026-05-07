const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Scenario = sequelize.define('Scenario', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên kịch bản, VD: "Luồng đăng ký → đăng nhập"'
  },
  stop_on_error: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Dừng toàn bộ scenario nếu 1 step bị lỗi'
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Mảng các bước: [{ order, requestId, extractors, assertions }]',
    get() {
      const rawValue = this.getDataValue('steps');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue || [];
    },
    set(value) {
      if (typeof value === 'string') {
        try {
          this.setDataValue('steps', JSON.parse(value));
        } catch (e) {
          this.setDataValue('steps', value);
        }
      } else {
        this.setDataValue('steps', value);
      }
    }
  }
}, {
  tableName: 'scenarios',
  comment: 'Kịch bản test nhiều API tuần tự, hỗ trợ truyền biến giữa các bước',
  timestamps: true,
  underscored: true
});

module.exports = Scenario;
