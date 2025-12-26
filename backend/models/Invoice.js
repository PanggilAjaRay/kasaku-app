// models/Invoice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_email: {
    type: DataTypes.STRING,
  },
  customer_phone: {
    type: DataTypes.STRING,
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'DRAFT',
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'TRANSFER',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'invoices',
  timestamps: true,
});

module.exports = Invoice;