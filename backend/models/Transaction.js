// models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `TRX-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Umum',
  },
  project_id: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

module.exports = Transaction;