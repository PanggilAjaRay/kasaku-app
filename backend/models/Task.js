// models/Task.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `T-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  project_id: {
    type: DataTypes.STRING,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  assignee: {
    type: DataTypes.STRING,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'),
    defaultValue: 'TODO',
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM',
  },
}, {
  tableName: 'tasks',
  timestamps: true,
});

module.exports = Task;