// controllers/licenseController.js
const { Subscription, Addon } = require('../models');

const getLicense = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { user_id: req.user.id }
    });

    const addon = await Addon.findOne({
      where: { user_id: req.user.id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Lisensi tidak ditemukan.' });
    }

    // Hitung days_left
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    // Tentukan status
    let status = 'OK';
    if (subscription.status === 'EXPIRED' || daysLeft <= 0) {
      status = 'EXPIRED';
    } else if (subscription.status === 'SUSPENDED') {
      status = 'SUSPENDED';
    }

    const response = {
      status,
      plan: subscription.plan,
      days_left: daysLeft > 0 ? daysLeft : 0,
      addons: {
        manufacturing: addon?.manufacturing || false,
        restaurant: addon?.restaurant || false,
        plus_advance: addon?.plus_advance || false,
        custom_branding: addon?.custom_branding || false
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data lisensi.' });
  }
};

const updateAddon = async (req, res) => {
  try {
    const { addon, value } = req.body;
    const validAddons = ['manufacturing', 'restaurant', 'plus_advance', 'custom_branding'];

    if (!validAddons.includes(addon)) {
      return res.status(400).json({ error: 'Addon tidak valid.' });
    }

    const addonData = await Addon.findOne({
      where: { user_id: req.user.id }
    });

    if (!addonData) {
      return res.status(404).json({ error: 'Data addon tidak ditemukan.' });
    }

    // Update addon
    addonData[addon] = value;
    await addonData.save();

    res.json({ 
      message: `Addon ${addon} berhasil di${value ? 'aktifkan' : 'nonaktifkan'}.`,
      addons: addonData
    });

  } catch (error) {
    console.error('Update addon error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate addon.' });
  }
};

module.exports = { getLicense, updateAddon };