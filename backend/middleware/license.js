// middleware/license.js
const { Subscription } = require('../models');

const checkLicense = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { user_id: req.user.id }
    });

    if (!subscription) {
      return res.status(403).json({ error: 'Lisensi tidak ditemukan.' });
    }

    // Cek apakah lisensi masih aktif
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (subscription.status === 'EXPIRED' || daysLeft <= 0) {
      return res.status(403).json({ 
        error: 'Lisensi telah kadaluarsa.', 
        status: 'EXPIRED' 
      });
    }

    req.license = {
      plan: subscription.plan,
      days_left: daysLeft,
      status: 'OK'
    };

    next();
  } catch (error) {
    console.error('License check error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memeriksa lisensi.' });
  }
};

module.exports = { checkLicense };