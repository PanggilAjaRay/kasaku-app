// controllers/invoiceController.js
const { Invoice } = require('../models');

const getAllInvoices = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const whereClause = { user_id: req.user.id };
    
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.issue_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      order: [['issue_date', 'DESC']]
    });

    res.json(invoices);

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil invoice.' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice tidak ditemukan.' });
    }

    res.json(invoice);

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil invoice.' });
  }
};

const createInvoice = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      due_date,
      total_amount,
      tax_amount,
      items,
      payment_method,
      notes
    } = req.body;

    // Validasi
    if (!customer_name || !due_date || !total_amount) {
      return res.status(400).json({ error: 'Data customer, due date, dan total amount wajib diisi.' });
    }

    const invoice = await Invoice.create({
      user_id: req.user.id,
      customer_name,
      customer_email: customer_email || '',
      customer_phone: customer_phone || '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date,
      total_amount: parseFloat(total_amount),
      tax_amount: tax_amount ? parseFloat(tax_amount) : 0,
      status: 'PENDING',
      items: items || [],
      payment_method: payment_method || 'TRANSFER',
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Invoice berhasil dibuat.',
      invoice
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat invoice.' });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      due_date,
      total_amount,
      tax_amount,
      status,
      items,
      payment_method,
      notes
    } = req.body;

    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice tidak ditemukan.' });
    }

    // Update
    invoice.customer_name = customer_name || invoice.customer_name;
    invoice.customer_email = customer_email || invoice.customer_email;
    invoice.customer_phone = customer_phone || invoice.customer_phone;
    invoice.due_date = due_date || invoice.due_date;
    invoice.total_amount = total_amount ? parseFloat(total_amount) : invoice.total_amount;
    invoice.tax_amount = tax_amount ? parseFloat(tax_amount) : invoice.tax_amount;
    invoice.status = status || invoice.status;
    invoice.items = items || invoice.items;
    invoice.payment_method = payment_method || invoice.payment_method;
    invoice.notes = notes || invoice.notes;

    await invoice.save();

    res.json({
      message: 'Invoice berhasil diperbarui.',
      invoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui invoice.' });
  }
};

const markInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice tidak ditemukan.' });
    }

    invoice.status = 'PAID';
    invoice.payment_method = req.body.payment_method || invoice.payment_method;
    await invoice.save();

    res.json({
      message: 'Invoice berhasil ditandai sebagai Lunas.',
      invoice
    });

  } catch (error) {
    console.error('Mark invoice paid error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menandai invoice.' });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoicePaid
};