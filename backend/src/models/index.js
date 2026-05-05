const sequelize = require('../config/sequelize');
const Environment = require('./Environment');
const Collection = require('./Collection');
const Request = require('./Request');
const TestHistory = require('./TestHistory');
const Scenario = require('./Scenario');
const DataDrivenTest = require('./DataDrivenTest');
const User = require('./User');

// Associations
Collection.hasMany(Request, { foreignKey: 'collection_id', as: 'requests' });
Request.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

Request.hasMany(TestHistory, { foreignKey: 'request_id', as: 'histories' });
TestHistory.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

Collection.hasMany(Scenario, { foreignKey: 'collection_id', as: 'scenarios' });
Scenario.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

Request.hasMany(DataDrivenTest, { foreignKey: 'request_id', as: 'dataDrivenTests' });
DataDrivenTest.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

module.exports = {
  sequelize,
  Environment,
  Collection,
  Request,
  TestHistory,
  Scenario,
  DataDrivenTest,
  User
};
