// models/Addon.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Addon = sequelize.define('Addon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  manufacturing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  restaurant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  plus_advance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  custom_branding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'addons',
  timestamps: false,
});

module.exports = Addon;