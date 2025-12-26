// models/index.js
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Subscription = require('./Subscription');
const Addon = require('./Addon');
const Transaction = require('./Transaction');
const Invoice = require('./Invoice');
const Client = require('./Client');
const Project = require('./Project');
const Task = require('./Task');
const CalendarEvent = require('./CalendarEvent');
const Inventory = require('./Inventory');
const BOM = require('./BOM');
const ProductionOrder = require('./ProductionOrder');
const MenuItem = require('./MenuItem');
const POSOrder = require('./POSOrder');

// Define associations
User.hasOne(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Addon, { foreignKey: 'user_id' });
Addon.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Invoice, { foreignKey: 'user_id' });
Invoice.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Client, { foreignKey: 'user_id' });
Client.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Project, { foreignKey: 'user_id' });
Project.belongsTo(User, { foreignKey: 'user_id' });

Client.hasMany(Project, { foreignKey: 'client_id' });
Project.belongsTo(Client, { foreignKey: 'client_id' });

Project.hasMany(Task, { foreignKey: 'project_id' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(Task, { foreignKey: 'user_id' });
Task.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CalendarEvent, { foreignKey: 'user_id' });
CalendarEvent.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Inventory, { foreignKey: 'user_id' });
Inventory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(BOM, { foreignKey: 'user_id' });
BOM.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ProductionOrder, { foreignKey: 'user_id' });
ProductionOrder.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(MenuItem, { foreignKey: 'user_id' });
MenuItem.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(POSOrder, { foreignKey: 'user_id' });
POSOrder.belongsTo(User, { foreignKey: 'user_id' });

// BOM - ProductionOrder association
BOM.hasMany(ProductionOrder, { foreignKey: 'bom_id', as: 'productionOrders' });
ProductionOrder.belongsTo(BOM, { foreignKey: 'bom_id', as: 'bom' });

module.exports = {
  sequelize,
  User,
  Subscription,
  Addon,
  Transaction,
  Invoice,
  Client,
  Task,
  CalendarEvent,
  Inventory,
  BOM,
  ProductionOrder,
  MenuItem,
  POSOrder,
  Project
};