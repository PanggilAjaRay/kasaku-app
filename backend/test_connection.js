// test_connection.js
require('dotenv').config();
const sequelize = require('./config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    console.log('Database:', process.env.DB_NAME);
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    await sequelize.close();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
