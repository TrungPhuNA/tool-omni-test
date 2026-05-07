const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Sẽ tạo file này để export instance

const Environment = sequelize.define('Environment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID tự tăng'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên môi trường: Dev / Staging / Production'
  },
  variables: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Key-value biến môi trường, VD: { BASE_URL: "...", TOKEN: "..." }',
    get() {
      const rawValue = this.getDataValue('variables');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return rawValue;
        }
      }
      return rawValue || {};
    },
    set(value) {
      if (typeof value === 'string') {
        try {
          this.setDataValue('variables', JSON.parse(value));
        } catch (e) {
          this.setDataValue('variables', value);
        }
      } else {
        this.setDataValue('variables', value);
      }
    }
  }
}, {
  tableName: 'environments',
  comment: 'Lưu các môi trường test (Dev/Staging/Prod) và biến tương ứng',
  timestamps: true,
  underscored: true
});

module.exports = Environment;
