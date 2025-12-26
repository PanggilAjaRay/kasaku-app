// models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_id: {
    type: DataTypes.STRING,
  },
  client_name: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'),
    defaultValue: 'PLANNING',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
  }
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Project;
