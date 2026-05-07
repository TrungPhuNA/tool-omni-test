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
    comment: 'Raw response body (cắt bớt nếu > 100KB)',
    get() {
      const rawValue = this.getDataValue('response');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue;
    },
    set(value) {
      if (typeof value === 'string') {
        try {
          this.setDataValue('response', JSON.parse(value));
        } catch (e) {
          this.setDataValue('response', value);
        }
      } else {
        this.setDataValue('response', value);
      }
    }
  },
  assert_result: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Kết quả chi tiết từng assertion: [{ rule, pass, actual }]',
    get() {
      const rawValue = this.getDataValue('assert_result');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue || [];
    },
    set(value) {
      if (typeof value === 'string') {
        try {
          this.setDataValue('assert_result', JSON.parse(value));
        } catch (e) {
          this.setDataValue('assert_result', value);
        }
      } else {
        this.setDataValue('assert_result', value);
      }
    }
  },
  load_summary: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Tổng hợp load test: { rps, p95, p99, errorRate }',
    get() {
      const rawValue = this.getDataValue('load_summary');
      if (typeof rawValue === 'string') {
        try { return JSON.parse(rawValue); } catch (e) { return rawValue; }
      }
      return rawValue;
    },
    set(value) {
      if (typeof value === 'string') {
        try {
          this.setDataValue('load_summary', JSON.parse(value));
        } catch (e) {
          this.setDataValue('load_summary', value);
        }
      } else {
        this.setDataValue('load_summary', value);
      }
    }
  }
}, {
  tableName: 'test_histories',
  comment: 'Lịch sử các lần chạy test để so sánh hiệu năng qua từng Sprint',
  timestamps: true,
  underscored: true
});

module.exports = TestHistory;
