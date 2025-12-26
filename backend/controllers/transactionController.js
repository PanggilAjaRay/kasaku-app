// controllers/transactionController.js
const { Transaction } = require('../models');

const getAllTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate, category } = req.query;
    
    const whereClause = { user_id: req.user.id };
    
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(transactions);

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil transaksi.' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
    }

    res.json(transaction);

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil transaksi.' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { date, description, amount, type, category, tax, notes } = req.body;

    // Validasi
    if (!date || !description || !amount || !type) {
      return res.status(400).json({ error: 'Data tidak lengkap.' });
    }

    const transaction = await Transaction.create({
      user_id: req.user.id,
      date,
      description,
      amount: parseFloat(amount),
      type,
      category: category || 'Umum',
      tax: tax || 0,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Transaksi berhasil dibuat.',
      transaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat transaksi.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { date, description, amount, type, category, tax, notes } = req.body;

    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
    }

    // Update
    transaction.date = date || transaction.date;
    transaction.description = description || transaction.description;
    transaction.amount = amount ? parseFloat(amount) : transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.tax = tax || transaction.tax;
    transaction.notes = notes || transaction.notes;

    await transaction.save();

    res.json({
      message: 'Transaksi berhasil diperbarui.',
      transaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui transaksi.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
    }

    await transaction.destroy();

    res.json({ message: 'Transaksi berhasil dihapus.' });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus transaksi.' });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};