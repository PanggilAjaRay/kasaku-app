// controllers/bomController.js
const { BOM, Inventory } = require('../models');
const { Op } = require('sequelize');

const getAllBOMs = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = { user_id: req.user.id };

    if (search) {
      whereClause[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { product_code: { [Op.like]: `%${search}%` } }
      ];
    }

    const boms = await BOM.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(boms);

  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data BOM.' });
  }
};

const getBOMById = async (req, res) => {
  try {
    const bom = await BOM.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!bom) {
      return res.status(404).json({ error: 'BOM tidak ditemukan.' });
    }

    // Ambil detail bahan baku
    const materialIds = bom.items.map(item => item.materialId);
    const materials = await Inventory.findAll({
      where: {
        id: { [Op.in]: materialIds }
      }
    });

    const itemsWithDetails = bom.items.map(item => {
      const material = materials.find(m => m.id === item.materialId);
      return {
        ...item,
        material_name: material?.name || 'Unknown',
        material_unit: material?.unit || 'pcs',
        material_cost: material?.cost_per_unit || 0
      };
    });

    // Hitung ulang estimated cost
    const recalculatedCost = itemsWithDetails.reduce((sum, item) => {
      return sum + (item.material_cost * item.qtyRequired);
    }, 0);

    res.json({
      ...bom.toJSON(),
      items: itemsWithDetails,
      estimated_cost: recalculatedCost
    });

  } catch (error) {
    console.error('Get BOM error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data BOM.' });
  }
};

const createBOM = async (req, res) => {
  try {
    const { product_name, product_code, selling_price, items, notes } = req.body;

    // Validasi
    if (!product_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Nama produk dan daftar bahan wajib diisi.' });
    }

    // Validasi items
    for (const item of items) {
      if (!item.materialId || !item.qtyRequired) {
        return res.status(400).json({ error: 'Setiap item harus memiliki materialId dan qtyRequired.' });
      }
    }

    // Hitung estimated cost
    let estimatedCost = 0;
    for (const item of items) {
      const material = await Inventory.findOne({
        where: {
          id: item.materialId,
          user_id: req.user.id
        }
      });

      if (!material) {
        return res.status(404).json({ error: `Bahan baku dengan ID ${item.materialId} tidak ditemukan.` });
      }

      estimatedCost += material.cost_per_unit * item.qtyRequired;
    }

    const bom = await BOM.create({
      user_id: req.user.id,
      product_name,
      product_code: product_code || '',
      estimated_cost: estimatedCost,
      selling_price: selling_price ? parseFloat(selling_price) : null,
      items,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'BOM berhasil dibuat.',
      bom
    });

  } catch (error) {
    console.error('Create BOM error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat BOM.' });
  }
};

const updateBOM = async (req, res) => {
  try {
    const { product_name, product_code, selling_price, items, notes } = req.body;

    const bom = await BOM.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!bom) {
      return res.status(404).json({ error: 'BOM tidak ditemukan.' });
    }

    // Hitung estimated cost jika items diubah
    let estimatedCost = bom.estimated_cost;
    if (items && Array.isArray(items)) {
      estimatedCost = 0;
      for (const item of items) {
        const material = await Inventory.findOne({
          where: {
            id: item.materialId,
            user_id: req.user.id
          }
        });

        if (!material) {
          return res.status(404).json({ error: `Bahan baku dengan ID ${item.materialId} tidak ditemukan.` });
        }

        estimatedCost += material.cost_per_unit * item.qtyRequired;
      }
      bom.items = items;
    }

    // Update
    bom.product_name = product_name || bom.product_name;
    bom.product_code = product_code || bom.product_code;
    bom.estimated_cost = estimatedCost;
    bom.selling_price = selling_price ? parseFloat(selling_price) : bom.selling_price;
    bom.notes = notes || bom.notes;

    await bom.save();

    res.json({
      message: 'BOM berhasil diperbarui.',
      bom
    });

  } catch (error) {
    console.error('Update BOM error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui BOM.' });
  }
};

const deleteBOM = async (req, res) => {
  try {
    const bom = await BOM.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!bom) {
      return res.status(404).json({ error: 'BOM tidak ditemukan.' });
    }

    // Cek apakah BOM digunakan dalam production order
    const ProductionOrder = require('../models/ProductionOrder');
    const productionOrders = await ProductionOrder.findAll({
      where: {
        bom_id: bom.id,
        status: { [Op.in]: ['PLANNED', 'IN_PROGRESS'] }
      }
    });

    if (productionOrders.length > 0) {
      return res.status(400).json({
        error: 'BOM tidak dapat dihapus karena masih digunakan dalam perintah produksi yang aktif.',
        active_orders: productionOrders.map(po => po.id)
      });
    }

    await bom.destroy();

    res.json({ message: 'BOM berhasil dihapus.' });

  } catch (error) {
    console.error('Delete BOM error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus BOM.' });
  }
};

const calculateBOMCost = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items harus berupa array.' });
    }

    let totalCost = 0;
    const itemsWithDetails = [];

    for (const item of items) {
      const material = await Inventory.findOne({
        where: {
          id: item.materialId,
          user_id: req.user.id
        }
      });

      if (!material) {
        return res.status(404).json({ error: `Bahan baku dengan ID ${item.materialId} tidak ditemukan.` });
      }

      const itemCost = material.cost_per_unit * item.qtyRequired;
      totalCost += itemCost;

      itemsWithDetails.push({
        ...item,
        material_name: material.name,
        material_unit: material.unit,
        material_cost: material.cost_per_unit,
        item_cost: itemCost
      });
    }

    res.json({
      total_cost: totalCost,
      items: itemsWithDetails
    });

  } catch (error) {
    console.error('Calculate BOM cost error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghitung biaya BOM.' });
  }
};

module.exports = {
  getAll: getAllBOMs,
  getById: getBOMById,
  create: createBOM,
  update: updateBOM,
  delete: deleteBOM,
  calculateBOMCost
};