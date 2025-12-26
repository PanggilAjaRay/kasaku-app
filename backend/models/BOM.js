// models/BOM.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BOM = sequelize.define('BOM', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `BOM-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product_code: {
    type: DataTypes.STRING,
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  selling_price: {
    type: DataTypes.DECIMAL(15, 2),
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'boms',
  timestamps: true,
});

module.exports = BOM;