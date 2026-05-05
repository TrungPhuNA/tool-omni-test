const sequelize = require('../config/sequelize');
const Environment = require('./Environment');
const Collection = require('./Collection');
const Request = require('./Request');
const Folder = require('./Folder');
const TestHistory = require('./TestHistory');
const Scenario = require('./Scenario');
const DataDrivenTest = require('./DataDrivenTest');
const RequestExample = require('./RequestExample');
const User = require('./User');
const CollectionShare = require('./CollectionShare');

// Associations
Collection.hasMany(Folder, { foreignKey: 'collection_id', as: 'folders' });
Folder.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

Collection.hasMany(Request, { foreignKey: 'collection_id', as: 'requests' });
Request.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

Folder.hasMany(Request, { foreignKey: 'folder_id', as: 'requests' });
Request.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });

Request.hasMany(TestHistory, { foreignKey: 'request_id', as: 'histories' });
TestHistory.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

Request.hasMany(RequestExample, { foreignKey: 'request_id', as: 'examples' });
RequestExample.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

Collection.hasMany(Scenario, { foreignKey: 'collection_id', as: 'scenarios' });
Scenario.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

Collection.hasMany(CollectionShare, { foreignKey: 'collection_id', as: 'shares' });
CollectionShare.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

User.hasMany(CollectionShare, { foreignKey: 'user_id', as: 'createdShares' });
CollectionShare.belongsTo(User, { foreignKey: 'user_id', as: 'sharer' });

Request.hasMany(DataDrivenTest, { foreignKey: 'request_id', as: 'dataDrivenTests' });
DataDrivenTest.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

module.exports = {
  sequelize,
  Environment,
  Collection,
  Request,
  Folder,
  TestHistory,
  Scenario,
  DataDrivenTest,
  RequestExample,
  User,
  CollectionShare
};
