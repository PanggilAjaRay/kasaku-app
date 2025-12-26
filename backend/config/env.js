// config/env.js
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const development = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'development_secret_key',
  dbPath: process.env.DB_PATH || './database/kasaku.db',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

const production = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  dbPath: process.env.DB_PATH || '/data/kasaku.db',
  frontendUrl: process.env.FRONTEND_URL,
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL,
};

const test = {
  port: process.env.PORT || 3001,
  jwtSecret: 'test_secret_key',
  dbPath: ':memory:',
  frontendUrl: 'http://localhost:5173',
  corsOrigin: 'http://localhost:5173',
};

const config = {
  development,
  production,
  test,
};

module.exports = config[env];