// models/POSOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const POSOrder = sequelize.define('POSOrder', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `POS-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  order_time: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW,
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'CARD', 'QRIS', 'TRANSFER'),
    defaultValue: 'CASH',
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  customer_name: {
    type: DataTypes.STRING,
  },
  table_number: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'pos_orders',
  timestamps: true,
});

module.exports = POSOrder;