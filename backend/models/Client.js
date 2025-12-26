// models/Client.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `C-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
  },
  total_revenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  last_transaction_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: 'clients',
  timestamps: true,
});

module.exports = Client;