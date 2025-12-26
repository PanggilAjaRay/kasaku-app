// controllers/clientController.js
const { Client, Transaction } = require('../models');
const { Op } = require('sequelize');

const getAllClients = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    const whereClause = { user_id: req.user.id };
    
    if (status) whereClause.status = status;
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const clients = await Client.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(clients);

  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data klien.' });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Klien tidak ditemukan.' });
    }

    // Ambri transaksi terkait
    const transactions = await Transaction.findAll({
      where: {
        user_id: req.user.id,
        description: { [Op.like]: `%${client.company}%` }
      },
      limit: 10,
      order: [['date', 'DESC']]
    });

    res.json({
      client,
      recent_transactions: transactions
    });

  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data klien.' });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, company, email, phone, address, status } = req.body;

    // Validasi
    if (!name || !company) {
      return res.status(400).json({ error: 'Nama dan perusahaan wajib diisi.' });
    }

    const client = await Client.create({
      user_id: req.user.id,
      name,
      company,
      email: email || '',
      phone: phone || '',
      address: address || '',
      status: status || 'ACTIVE',
      total_revenue: 0
    });

    res.status(201).json({
      message: 'Klien berhasil dibuat.',
      client
    });

  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat klien.' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { name, company, email, phone, address, status } = req.body;

    const client = await Client.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Klien tidak ditemukan.' });
    }

    // Update
    client.name = name || client.name;
    client.company = company || client.company;
    client.email = email || client.email;
    client.phone = phone || client.phone;
    client.address = address || client.address;
    client.status = status || client.status;

    await client.save();

    res.json({
      message: 'Klien berhasil diperbarui.',
      client
    });

  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui klien.' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Klien tidak ditemukan.' });
    }

    await client.destroy();

    res.json({ message: 'Klien berhasil dihapus.' });

  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus klien.' });
  }
};

const updateClientRevenue = async (clientId, amount) => {
  try {
    const client = await Client.findByPk(clientId);
    if (client) {
      client.total_revenue = (parseFloat(client.total_revenue) || 0) + amount;
      client.last_transaction_date = new Date().toISOString().split('T')[0];
      await client.save();
    }
  } catch (error) {
    console.error('Update client revenue error:', error);
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  updateClientRevenue
};