const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per windowMs
  message: 'Terlalu banyak request dari IP ini, coba lagi dalam 15 menit.'
});

app.use('/api/auth/login', limiter);