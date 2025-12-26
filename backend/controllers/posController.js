// controllers/posController.js
const { POSOrder, MenuItem, Transaction } = require('../models');
const { Op } = require('sequelize');

const getAllOrders = async (req, res) => {
  try {
    const { start_date, end_date, payment_method } = req.query;
    
    const whereClause = { user_id: req.user.id };
    
    if (start_date && end_date) {
      whereClause.order_date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    if (payment_method) whereClause.payment_method = payment_method;

    const orders = await POSOrder.findAll({
      where: whereClause,
      order: [['order_date', 'DESC'], ['order_time', 'DESC']]
    });

    res.json(orders);

  } catch (error) {
    console.error('Get POS orders error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data order.' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await POSOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan.' });
    }

    // Ambil detail menu items
    const itemIds = order.items.map(item => item.id);
    const menuItems = await MenuItem.findAll({
      where: {
        id: { [Op.in]: itemIds }
      }
    });

    const itemsWithDetails = order.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.id);
      return {
        ...item,
        name: menuItem?.name || 'Unknown',
        price: menuItem?.price || item.price
      };
    });

    res.json({
      ...order.toJSON(),
      items: itemsWithDetails
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data order.' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, subtotal, tax_amount, total_amount, payment_method, customer_name, table_number, notes } = req.body;

    // Validasi
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items harus berupa array dan tidak boleh kosong.' });
    }

    if (!total_amount) {
      return res.status(400).json({ error: 'Total amount wajib diisi.' });
    }

    // Validasi items
    for (const item of items) {
      if (!item.id || !item.qty || !item.price) {
        return res.status(400).json({ error: 'Setiap item harus memiliki id, qty, dan price.' });
      }

      // Cek apakah menu item ada
      const menuItem = await MenuItem.findOne({
        where: {
          id: item.id,
          user_id: req.user.id
        }
      });

      if (!menuItem) {
        return res.status(404).json({ error: `Menu item dengan ID ${item.id} tidak ditemukan.` });
      }

      if (!menuItem.is_active) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} tidak aktif.` });
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Hitung subtotal dan tax jika tidak disediakan
    let calculatedSubtotal = subtotal;
    let calculatedTax = tax_amount;
    
    if (!calculatedSubtotal) {
      calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }
    
    if (!calculatedTax) {
      // Default tax 11%
      calculatedTax = calculatedSubtotal * 0.11;
    }

    const calculatedTotal = total_amount || (calculatedSubtotal + calculatedTax);

    const order = await POSOrder.create({
      user_id: req.user.id,
      order_date: today,
      order_time: now,
      subtotal: calculatedSubtotal,
      tax_amount: calculatedTax,
      total_amount: calculatedTotal,
      payment_method: payment_method || 'CASH',
      items,
      customer_name: customer_name || '',
      table_number: table_number || '',
      notes: notes || ''
    });

    // Buat transaksi
    await Transaction.create({
      user_id: req.user.id,
      date: today,
      description: `Penjualan POS #${order.id.slice(-6)}`,
      amount: calculatedTotal,
      type: 'income',
      category: 'Penjualan Restoran',
      projectId: 'RESTO-POS',
      notes: `Customer: ${customer_name || 'Walk-in'}, Items: ${items.length}`
    });

    res.status(201).json({
      message: 'Order berhasil dibuat.',
      order,
      transaction_id: `TRX-POS-${order.id}`
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat order.' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { items, subtotal, tax_amount, total_amount, payment_method, customer_name, table_number, notes } = req.body;

    const order = await POSOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan.' });
    }

    // Update
    if (items && Array.isArray(items)) {
      order.items = items;
    }
    
    order.subtotal = subtotal ? parseFloat(subtotal) : order.subtotal;
    order.tax_amount = tax_amount ? parseFloat(tax_amount) : order.tax_amount;
    order.total_amount = total_amount ? parseFloat(total_amount) : order.total_amount;
    order.payment_method = payment_method || order.payment_method;
    order.customer_name = customer_name || order.customer_name;
    order.table_number = table_number || order.table_number;
    order.notes = notes || order.notes;

    await order.save();

    res.json({
      message: 'Order berhasil diperbarui.',
      order
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui order.' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await POSOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan.' });
    }

    // Hapus transaksi terkait
    await Transaction.destroy({
      where: {
        user_id: req.user.id,
        description: { [Op.like]: `%${order.id.slice(-6)}%` }
      }
    });

    await order.destroy();

    res.json({ message: 'Order berhasil dihapus.' });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus order.' });
  }
};

const getReceipt = async (req, res) => {
  try {
    const order = await POSOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan.' });
    }

    // Format receipt
    const receipt = {
      id: order.id,
      date: order.order_date,
      time: order.order_time,
      customer_name: order.customer_name || 'Walk-in Customer',
      table_number: order.table_number || 'Take Away',
      items: order.items,
      subtotal: order.subtotal,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      notes: order.notes || ''
    };

    res.json(receipt);

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil receipt.' });
  }
};

const getDailySales = async (req, res) => {
  try {
    const { date } = req.params;

    const orders = await POSOrder.findAll({
      where: {
        user_id: req.user.id,
        order_date: date
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sales by payment method
    const salesByPayment = {};
    orders.forEach(order => {
      const method = order.payment_method;
      salesByPayment[method] = (salesByPayment[method] || 0) + order.total_amount;
    });

    res.json({
      date,
      total_sales: totalSales,
      total_orders: totalOrders,
      avg_order_value: avgOrderValue,
      sales_by_payment: salesByPayment,
      orders: orders.map(order => ({
        id: order.id,
        time: order.order_time,
        total: order.total_amount,
        payment_method: order.payment_method,
        items_count: order.items.length
      }))
    });

  } catch (error) {
    console.error('Get daily sales error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data penjualan.' });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const whereClause = { 
      user_id: req.user.id 
    };

    if (start_date && end_date) {
      whereClause.order_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const orders = await POSOrder.findAll({
      where: whereClause,
      order: [['order_date', 'ASC']]
    });

    // Group by date
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.order_date;
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          total_sales: 0,
          total_orders: 0,
          subtotal: 0,
          tax: 0
        };
      }
      
      salesByDate[date].total_sales += order.total_amount;
      salesByDate[date].total_orders += 1;
      salesByDate[date].subtotal += order.subtotal;
      salesByDate[date].tax += order.tax_amount;
    });

    const report = {
      period: {
        start_date: start_date || 'N/A',
        end_date: end_date || 'N/A'
      },
      summary: {
        total_sales: orders.reduce((sum, order) => sum + order.total_amount, 0),
        total_orders: orders.length,
        total_subtotal: orders.reduce((sum, order) => sum + order.subtotal, 0),
        total_tax: orders.reduce((sum, order) => sum + order.tax_amount, 0),
        avg_order_value: orders.length > 0 ? 
          orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length : 0
      },
      daily_sales: Object.values(salesByDate),
      payment_methods: {}
    };

    // Payment method breakdown
    orders.forEach(order => {
      const method = order.payment_method;
      if (!report.payment_methods[method]) {
        report.payment_methods[method] = {
          method,
          total_sales: 0,
          order_count: 0
        };
      }
      report.payment_methods[method].total_sales += order.total_amount;
      report.payment_methods[method].order_count += 1;
    });

    report.payment_methods = Object.values(report.payment_methods);

    res.json(report);

  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat laporan penjualan.' });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getReceipt,
  getDailySales,
  getSalesReport
};