// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const clientRoutes = require('./routes/clientRoutes');
const taskRoutes = require('./routes/taskRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const manufacturingRoutes = require('./routes/manufacturingRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/restaurant', restaurantRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

// Sync database and start server
const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(() => {
  console.log('Database connected and synced.');

  app.listen(PORT, () => {
    console.log(`Kasaku backend running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection error:', err);
});