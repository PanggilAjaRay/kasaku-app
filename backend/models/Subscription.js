// models/Subscription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  plan: {
    type: DataTypes.ENUM('FREE', 'PRO', 'ENTERPRISE'),
    defaultValue: 'FREE',
  },
  start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED'),
    defaultValue: 'ACTIVE',
  },
}, {
  tableName: 'subscriptions',
  timestamps: false,
});

module.exports = Subscription;