// middleware/addons.js
const { Addon } = require('../models');

const checkAddon = (addonName) => {
  return async (req, res, next) => {
    try {
      const addon = await Addon.findOne({
        where: { user_id: req.user.id }
      });

      if (!addon) {
        return res.status(403).json({ error: 'Addon tidak ditemukan.' });
      }

      if (!addon[addonName]) {
        return res.status(403).json({ 
          error: `Addon "${addonName}" tidak aktif. Silakan aktifkan di halaman profil.` 
        });
      }

      next();
    } catch (error) {
      console.error('Addon check error:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat memeriksa addon.' });
    }
  };
};

module.exports = { checkAddon };