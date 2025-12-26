// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Subscription, Addon } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi.' });
    }

    // Cari user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Verifikasi password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        company_name: user.company_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      sameSite: 'lax'
    });

    res.json({
      message: 'Login berhasil.',
      user: {
        id: user.id,
        email: user.email,
        company_name: user.company_name,
        admin_name: user.admin_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login.' });
  }
};

const register = async (req, res) => {
  try {
    const { company_name, admin_name, email, password } = req.body;

    if (!company_name || !admin_name || !email || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      company_name,
      admin_name,
      email,
      password_hash
    });

    // Create Default Subscription (Trial)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await Subscription.create({
      user_id: user.id,
      plan_type: 'TRIAL',
      start_date: new Date(),
      end_date: futureDate,
      status: 'ACTIVE'
    });

    // Create Default Addons
    await Addon.create({
      user_id: user.id,
      manufacturing: false,
      restaurant: false,
      plus_advance: false,
      custom_branding: false
    });

    res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi.' });
  }
};


const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout berhasil.' });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'company_name', 'admin_name', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    // Ambil data subscription
    const subscription = await Subscription.findOne({
      where: { user_id: user.id }
    });

    // Ambil data addon
    const addon = await Addon.findOne({
      where: { user_id: user.id }
    });

    res.json({
      user,
      subscription: subscription || null,
      addons: addon || {}
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil profil.' });
  }
};

module.exports = { login, logout, getProfile, register };