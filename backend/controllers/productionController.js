// controllers/productionController.js
const { ProductionOrder, BOM, Inventory } = require('../models');
const { Op } = require('sequelize');

const getAllProductionOrders = async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;

    const whereClause = { user_id: req.user.id };

    if (status) whereClause.status = status;
    if (start_date && end_date) {
      whereClause.order_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const orders = await ProductionOrder.findAll({
      where: whereClause,
      include: [{
        model: BOM,
        as: 'bom',
        attributes: ['product_name', 'product_code']
      }],
      order: [['order_date', 'DESC']]
    });

    res.json(orders);

  } catch (error) {
    console.error('Get production orders error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data produksi.' });
  }
};

const getProductionOrderById = async (req, res) => {
  try {
    const order = await ProductionOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [{
        model: BOM,
        as: 'bom',
        attributes: ['product_name', 'product_code', 'items']
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Perintah produksi tidak ditemukan.' });
    }

    // Hitung biaya aktual
    let actualCost = 0;
    if (order.bom && order.bom.items) {
      for (const item of order.bom.items) {
        const material = await Inventory.findOne({
          where: {
            id: item.materialId,
            user_id: req.user.id
          }
        });

        if (material) {
          actualCost += material.cost_per_unit * item.qtyRequired * order.quantity;
        }
      }
    }

    res.json({
      ...order.toJSON(),
      actual_cost: actualCost
    });

  } catch (error) {
    console.error('Get production order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data produksi.' });
  }
};

const createProductionOrder = async (req, res) => {
  try {
    const { bom_id, quantity, target_date, notes } = req.body;

    // Validasi
    if (!bom_id || !quantity) {
      return res.status(400).json({ error: 'BOM ID dan kuantitas wajib diisi.' });
    }

    // Cek BOM
    const bom = await BOM.findOne({
      where: {
        id: bom_id,
        user_id: req.user.id
      }
    });

    if (!bom) {
      return res.status(404).json({ error: 'BOM tidak ditemukan.' });
    }

    // Cek ketersediaan stok
    const stockCheck = await checkStockAvailability(bom_id, parseInt(quantity), req.user.id);
    if (!stockCheck.available) {
      return res.status(400).json({
        error: 'Stok bahan baku tidak mencukupi.',
        details: stockCheck.details
      });
    }

    const totalCost = bom.estimated_cost * parseInt(quantity);

    const order = await ProductionOrder.create({
      user_id: req.user.id,
      bom_id,
      order_date: new Date().toISOString().split('T')[0],
      target_date: target_date || null,
      quantity: parseInt(quantity),
      total_cost: totalCost,
      status: 'PLANNED',
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Perintah produksi berhasil dibuat.',
      order
    });

  } catch (error) {
    console.error('Create production order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat perintah produksi.' });
  }
};

const updateProductionOrder = async (req, res) => {
  try {
    const { bom_id, quantity, target_date, status, notes } = req.body;

    const order = await ProductionOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Perintah produksi tidak ditemukan.' });
    }

    // Jika mengubah status ke IN_PROGRESS, cek stok
    if (status === 'IN_PROGRESS' && order.status === 'PLANNED') {
      const stockCheck = await checkStockAvailability(order.bom_id, order.quantity, req.user.id);
      if (!stockCheck.available) {
        return res.status(400).json({
          error: 'Stok bahan baku tidak mencukupi untuk memulai produksi.',
          details: stockCheck.details
        });
      }
    }

    // Update
    order.bom_id = bom_id || order.bom_id;
    order.quantity = quantity ? parseInt(quantity) : order.quantity;
    order.target_date = target_date || order.target_date;
    order.status = status || order.status;
    order.notes = notes || order.notes;

    // Update total cost jika bom atau quantity berubah
    if (bom_id || quantity) {
      const bom = await BOM.findByPk(order.bom_id);
      if (bom) {
        order.total_cost = bom.estimated_cost * order.quantity;
      }
    }

    await order.save();

    res.json({
      message: 'Perintah produksi berhasil diperbarui.',
      order
    });

  } catch (error) {
    console.error('Update production order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui produksi.' });
  }
};

const deleteProductionOrder = async (req, res) => {
  try {
    const order = await ProductionOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Perintah produksi tidak ditemukan.' });
    }

    // Cek status
    if (order.status === 'IN_PROGRESS') {
      return res.status(400).json({
        error: 'Produksi sedang berjalan. Tidak dapat dihapus.'
      });
    }

    await order.destroy();

    res.json({ message: 'Perintah produksi berhasil dihapus.' });

  } catch (error) {
    console.error('Delete production order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus produksi.' });
  }
};

const completeProductionOrder = async (req, res) => {
  try {
    const order = await ProductionOrder.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [{
        model: BOM,
        as: 'bom'
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Perintah produksi tidak ditemukan.' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Produksi sudah selesai.' });
    }

    if (!order.bom) {
      return res.status(400).json({ error: 'Data BOM tidak ditemukan.' });
    }

    // Cek stok
    const stockCheck = await checkStockAvailability(order.bom_id, order.quantity, req.user.id);
    if (!stockCheck.available) {
      return res.status(400).json({
        error: 'Stok bahan baku tidak mencukupi.',
        details: stockCheck.details
      });
    }

    // Kurangi stok
    for (const item of order.bom.items) {
      const material = await Inventory.findOne({
        where: {
          id: item.materialId,
          user_id: req.user.id
        }
      });

      if (material) {
        const consumed = item.qtyRequired * order.quantity;
        material.current_stock -= consumed;
        await material.save();
      }
    }

    // Update status order
    order.status = 'COMPLETED';
    order.completed_date = new Date().toISOString().split('T')[0];
    await order.save();

    // Log ke transactions
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      user_id: req.user.id,
      date: order.completed_date,
      description: `Produksi ${order.bom.product_name} - ${order.quantity} unit`,
      amount: order.total_cost,
      type: 'expense',
      category: 'Biaya Produksi',
      notes: `Order ID: ${order.id}`
    });

    res.json({
      message: 'Produksi berhasil diselesaikan. Stok bahan baku telah dikurangi.',
      order
    });

  } catch (error) {
    console.error('Complete production order error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menyelesaikan produksi.' });
  }
};

// Helper function
const checkStockAvailability = async (bomId, quantity, userId) => {
  const bom = await BOM.findOne({
    where: {
      id: bomId,
      user_id: userId
    }
  });

  if (!bom || !bom.items) {
    return { available: false, details: 'BOM tidak ditemukan.' };
  }

  const details = [];
  let allAvailable = true;

  for (const item of bom.items) {
    const material = await Inventory.findOne({
      where: {
        id: item.materialId,
        user_id: userId
      }
    });

    if (!material) {
      details.push(`Bahan ${item.materialId} tidak ditemukan.`);
      allAvailable = false;
      continue;
    }

    const required = item.qtyRequired * quantity;
    if (material.current_stock < required) {
      details.push(`Bahan ${material.name}: Butuh ${required} ${material.unit}, Tersedia ${material.current_stock} ${material.unit}`);
      allAvailable = false;
    } else {
      details.push(`Bahan ${material.name}: OK`);
    }
  }

  return {
    available: allAvailable,
    details
  };
};

module.exports = {
  getAll: getAllProductionOrders,
  getById: getProductionOrderById,
  create: createProductionOrder,
  update: updateProductionOrder,
  delete: deleteProductionOrder,
  completeOrder: completeProductionOrder
};