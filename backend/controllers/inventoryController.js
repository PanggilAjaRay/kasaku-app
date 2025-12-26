// controllers/inventoryController.js
const { Inventory, ProductionOrder, BOM } = require('../models');
const { Op } = require('sequelize');

const getAllInventory = async (req, res) => {
  try {
    const { category, low_stock } = req.query;

    const whereClause = { user_id: req.user.id };

    if (category) whereClause.category = category;

    if (low_stock === 'true') {
      whereClause.current_stock = {
        [Op.lte]: Sequelize.col('min_stock_alert')
      };
    }

    const inventory = await Inventory.findAll({
      where: whereClause,
      order: [
        ['current_stock', 'ASC'], // Tampilkan yang stok rendah dulu
        ['name', 'ASC']
      ]
    });

    res.json(inventory);

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data inventaris.' });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Bahan baku tidak ditemukan.' });
    }

    // Cari BOM yang menggunakan bahan ini
    const bomsUsingMaterial = await BOM.findAll({
      where: {
        user_id: req.user.id,
        items: {
          [Op.contains]: [{ materialId: inventory.id }]
        }
      }
    });

    // Cari production orders yang menggunakan bahan ini
    const productionOrders = await ProductionOrder.findAll({
      where: {
        user_id: req.user.id,
        bom_id: bomsUsingMaterial.map(b => b.id)
      },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      inventory,
      used_in_boms: bomsUsingMaterial,
      recent_production_orders: productionOrders
    });

  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data bahan baku.' });
  }
};

const createInventory = async (req, res) => {
  try {
    const { name, category, unit, cost_per_unit, current_stock, min_stock_alert, supplier, notes } = req.body;

    // Validasi
    if (!name || !cost_per_unit) {
      return res.status(400).json({ error: 'Nama dan harga per unit wajib diisi.' });
    }

    const inventory = await Inventory.create({
      user_id: req.user.id,
      name,
      category: category || 'RAW_MATERIAL',
      unit: unit || 'pcs',
      cost_per_unit: parseFloat(cost_per_unit),
      current_stock: current_stock ? parseFloat(current_stock) : 0,
      min_stock_alert: min_stock_alert ? parseFloat(min_stock_alert) : 10,
      supplier: supplier || '',
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Bahan baku berhasil ditambahkan.',
      inventory
    });

  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan bahan baku.' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { name, category, unit, cost_per_unit, current_stock, min_stock_alert, supplier, notes } = req.body;

    const inventory = await Inventory.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Bahan baku tidak ditemukan.' });
    }

    // Update
    inventory.name = name || inventory.name;
    inventory.category = category || inventory.category;
    inventory.unit = unit || inventory.unit;
    inventory.cost_per_unit = cost_per_unit ? parseFloat(cost_per_unit) : inventory.cost_per_unit;
    inventory.current_stock = current_stock ? parseFloat(current_stock) : inventory.current_stock;
    inventory.min_stock_alert = min_stock_alert ? parseFloat(min_stock_alert) : inventory.min_stock_alert;
    inventory.supplier = supplier || inventory.supplier;
    inventory.notes = notes || inventory.notes;

    await inventory.save();

    res.json({
      message: 'Bahan baku berhasil diperbarui.',
      inventory
    });

  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui bahan baku.' });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Bahan baku tidak ditemukan.' });
    }

    // Cek apakah bahan digunakan di BOM
    const bomsUsingMaterial = await BOM.findAll({
      where: {
        user_id: req.user.id,
        items: {
          [Op.contains]: [{ materialId: inventory.id }]
        }
      }
    });

    if (bomsUsingMaterial.length > 0) {
      return res.status(400).json({
        error: 'Bahan baku tidak dapat dihapus karena masih digunakan dalam BOM.',
        used_in_boms: bomsUsingMaterial.map(b => b.product_name)
      });
    }

    await inventory.destroy();

    res.json({ message: 'Bahan baku berhasil dihapus.' });

  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus bahan baku.' });
  }
};

const updateStock = async (req, res) => {
  try {
    const { quantity, action, notes } = req.body; // action: 'add' or 'subtract'

    const inventory = await Inventory.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Bahan baku tidak ditemukan.' });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Jumlah harus angka positif.' });
    }

    // Update stock
    if (action === 'add') {
      inventory.current_stock += qty;
    } else if (action === 'subtract') {
      if (inventory.current_stock < qty) {
        return res.status(400).json({
          error: 'Stok tidak mencukupi.',
          current_stock: inventory.current_stock,
          requested: qty
        });
      }
      inventory.current_stock -= qty;
    } else {
      return res.status(400).json({ error: 'Aksi harus "add" atau "subtract".' });
    }

    await inventory.save();

    res.json({
      message: `Stok berhasil di${action === 'add' ? 'tambah' : 'kurang'}i.`,
      inventory,
      notes: notes || ''
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate stok.' });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.findAll({
      where: {
        user_id: req.user.id,
        current_stock: {
          [Op.lte]: Sequelize.col('min_stock_alert')
        }
      },
      order: [['current_stock', 'ASC']]
    });

    res.json(lowStockItems);

  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data stok rendah.' });
  }
};

module.exports = {
  getAll: getAllInventory,
  getById: getInventoryById,
  create: createInventory,
  update: updateInventory,
  delete: deleteInventory,
  updateStock,
  getLowStockItems
};