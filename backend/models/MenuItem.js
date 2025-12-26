// models/MenuItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `M-${Date.now()}`,
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
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  cogs: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  image_url: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'menu_items',
  timestamps: true,
});

module.exports = MenuItem;