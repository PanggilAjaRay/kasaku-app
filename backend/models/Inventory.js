// models/Inventory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `RM-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'RAW_MATERIAL',
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'pcs',
  },
  cost_per_unit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  current_stock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  min_stock_alert: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10,
  },
  supplier: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'inventory',
  timestamps: true,
});

module.exports = Inventory;