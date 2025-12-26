// models/CalendarEvent.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `EVT-${Date.now()}`,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('MEETING', 'REMINDER', 'TASK', 'INVOICE', 'PROJECT', 'OTHER'),
    defaultValue: 'MEETING',
  },
  description: {
    type: DataTypes.TEXT,
  },
  start_time: {
    type: DataTypes.TIME,
  },
  end_time: {
    type: DataTypes.TIME,
  },
}, {
  tableName: 'calendar_events',
  timestamps: true,
});

module.exports = CalendarEvent;