const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const DataDrivenTest = sequelize.define('DataDrivenTest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID tự tăng'
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK → requests.id — API cần test'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên bộ test, VD: "Test thêm sản phẩm"'
  },
  joi_schema: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Schema Joi để pre-validate body trước khi gửi'
  },
  test_cases: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Mảng các case: [{ caseName, body, params, expectedStatus, expectedCode }]'
  }
}, {
  tableName: 'data_driven_tests',
  comment: 'Test 1 API với nhiều bộ dữ liệu khác nhau, hỗ trợ validate kiểu trước khi gửi',
  timestamps: true,
  underscored: true
});

module.exports = DataDrivenTest;
