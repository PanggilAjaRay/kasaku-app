// models/ProductionOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionOrder = sequelize.define('ProductionOrder', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `PO-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bom_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  target_date: {
    type: DataTypes.DATEONLY,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PLANNED',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'production_orders',
  timestamps: true,
});

module.exports = ProductionOrder;