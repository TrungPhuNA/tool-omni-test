const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TestHistory = sequelize.define('TestHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID tự tăng'
  },
  request_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK → requests.id. NULL nếu là load test standalone'
  },
  type: {
    type: DataTypes.ENUM('functional', 'load'),
    allowNull: false,
    comment: 'Loại test: functional (kiểm thử chức năng) | load (kiểm thử tải)'
  },
  status: {
    type: DataTypes.ENUM('pass', 'fail', 'error'),
    allowNull: false,
    comment: 'Kết quả tổng: pass / fail / error (lỗi hệ thống)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Thời gian phản hồi tính bằng ms'
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'HTTP status code trả về từ target API'
  },
  response: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Raw response body (cắt bớt nếu > 100KB)'
  },
  assert_result: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Kết quả chi tiết từng assertion: [{ rule, pass, actual }]'
  },
  load_summary: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tổng hợp load test: { rps, p95, p99, errorRate }'
  }
}, {
  tableName: 'test_histories',
  comment: 'Lịch sử các lần chạy test để so sánh hiệu năng qua từng Sprint',
  timestamps: true,
  underscored: true
});

module.exports = TestHistory;
