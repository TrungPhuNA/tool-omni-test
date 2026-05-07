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
    allowNull: true,
    get() {
      let value = this.getDataValue('headers');
      while (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string' && parsed !== value) {
            value = parsed;
          } else {
            return parsed;
          }
        } catch (e) {
          return value || [];
        }
      }
      return value || [];
    },
    set(value) {
      if (typeof value === 'string') {
        try { this.setDataValue('headers', JSON.parse(value)); } catch (e) { this.setDataValue('headers', value); }
      } else { this.setDataValue('headers', value); }
    }
  },
  params: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      let value = this.getDataValue('params');
      while (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string' && parsed !== value) {
            value = parsed;
          } else {
            return parsed;
          }
        } catch (e) {
          return value || [];
        }
      }
      return value || [];
    },
    set(value) {
      if (typeof value === 'string') {
        try { this.setDataValue('params', JSON.parse(value)); } catch (e) { this.setDataValue('params', value); }
      } else { this.setDataValue('params', value); }
    }
  },
  body: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      let value = this.getDataValue('body');
      while (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string' && parsed !== value) {
            value = parsed;
          } else {
            return parsed;
          }
        } catch (e) {
          return value;
        }
      }
      return value;
    },
    set(value) {
      if (typeof value === 'string') {
        try { this.setDataValue('body', JSON.parse(value)); } catch (e) { this.setDataValue('body', value); }
      } else { this.setDataValue('body', value); }
    }
  },
  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  response_body: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      let value = this.getDataValue('response_body');
      while (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string' && parsed !== value) {
            value = parsed;
          } else {
            return parsed;
          }
        } catch (e) {
          return value;
        }
      }
      return value;
    },
    set(value) {
      if (typeof value === 'string') {
        try { this.setDataValue('response_body', JSON.parse(value)); } catch (e) { this.setDataValue('response_body', value); }
      } else { this.setDataValue('response_body', value); }
    }
  },
  response_headers: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      let value = this.getDataValue('response_headers');
      while (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string' && parsed !== value) {
            value = parsed;
          } else {
            return parsed;
          }
        } catch (e) {
          return value || {};
        }
      }
      return value || {};
    },
    set(value) {
      if (typeof value === 'string') {
        try { this.setDataValue('response_headers', JSON.parse(value)); } catch (e) { this.setDataValue('response_headers', value); }
      } else { this.setDataValue('response_headers', value); }
    }
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
