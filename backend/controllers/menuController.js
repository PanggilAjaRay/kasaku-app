// controllers/menuController.js
const { MenuItem } = require('../models');
const { Op } = require('sequelize');

const getAllMenuItems = async (req, res) => {
  try {
    const { category, search, active_only } = req.query;

    const whereClause = { user_id: req.user.id };

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const menuItems = await MenuItem.findAll({
      where: whereClause,
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.json(menuItems);

  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data menu.' });
  }
};

const getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuItem.findAll({
      attributes: ['category'],
      where: { user_id: req.user.id },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(cat => cat.category);

    res.json(categoryList);

  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil kategori menu.' });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item tidak ditemukan.' });
    }

    // Hitung margin
    const margin = menuItem.price - menuItem.cogs;
    const marginPercent = menuItem.price > 0 ? (margin / menuItem.price) * 100 : 0;

    res.json({
      ...menuItem.toJSON(),
      margin,
      margin_percent: marginPercent
    });

  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data menu.' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, cogs, description, image_url } = req.body;

    // Validasi
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Nama, kategori, dan harga wajib diisi.' });
    }

    const menuItem = await MenuItem.create({
      user_id: req.user.id,
      name,
      category: category.toUpperCase(),
      price: parseFloat(price),
      cogs: cogs ? parseFloat(cogs) : 0,
      description: description || '',
      image_url: image_url || '',
      is_active: true
    });

    res.status(201).json({
      message: 'Menu item berhasil dibuat.',
      menuItem
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat menu.' });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { name, category, price, cogs, description, image_url, is_active } = req.body;

    const menuItem = await MenuItem.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item tidak ditemukan.' });
    }

    // Update
    menuItem.name = name || menuItem.name;
    menuItem.category = category ? category.toUpperCase() : menuItem.category;
    menuItem.price = price ? parseFloat(price) : menuItem.price;
    menuItem.cogs = cogs ? parseFloat(cogs) : menuItem.cogs;
    menuItem.description = description || menuItem.description;
    menuItem.image_url = image_url || menuItem.image_url;
    menuItem.is_active = is_active !== undefined ? is_active : menuItem.is_active;

    await menuItem.save();

    res.json({
      message: 'Menu item berhasil diperbarui.',
      menuItem
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui menu.' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item tidak ditemukan.' });
    }

    // Cek apakah menu digunakan dalam order
    const POSOrder = require('../models/POSOrder');
    const orders = await POSOrder.findAll({
      where: {
        user_id: req.user.id,
        items: {
          [Op.contains]: [{ id: menuItem.id }]
        }
      },
      limit: 1
    });

    if (orders.length > 0) {
      return res.status(400).json({
        error: 'Menu tidak dapat dihapus karena masih digunakan dalam order.',
        suggestion: 'Nonaktifkan menu terlebih dahulu.'
      });
    }

    await menuItem.destroy();

    res.json({ message: 'Menu item berhasil dihapus.' });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus menu.' });
  }
};

const addCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi.' });
    }

    // Cek apakah kategori sudah ada
    const existing = await MenuItem.findOne({
      where: {
        user_id: req.user.id,
        category: category.toUpperCase()
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Kategori sudah ada.' });
    }

    // Tambahkan kategori dengan membuat dummy menu item
    const dummyItem = await MenuItem.create({
      user_id: req.user.id,
      name: `DUMMY_${Date.now()}`,
      category: category.toUpperCase(),
      price: 0,
      cogs: 0,
      is_active: false
    });

    // Hapus dummy item
    await dummyItem.destroy();

    res.json({
      message: 'Kategori berhasil ditambahkan.',
      category: category.toUpperCase()
    });

  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan kategori.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { name } = req.params;

    // Cek apakah ada menu dengan kategori ini
    const menuItems = await MenuItem.findAll({
      where: {
        user_id: req.user.id,
        category: name.toUpperCase()
      }
    });

    if (menuItems.length > 0) {
      return res.status(400).json({
        error: 'Kategori tidak dapat dihapus karena masih memiliki menu.',
        menu_count: menuItems.length,
        suggestion: 'Pindahkan atau hapus menu terlebih dahulu.'
      });
    }

    res.json({
      message: 'Kategori berhasil dihapus.',
      category: name.toUpperCase()
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus kategori.' });
  }
};

const getMenuStats = async (req, res) => {
  try {
    const totalItems = await MenuItem.count({
      where: { user_id: req.user.id }
    });

    const activeItems = await MenuItem.count({
      where: {
        user_id: req.user.id,
        is_active: true
      }
    });

    const categories = await getMenuCategories(req, res, true);

    // Hitung rata-rata margin
    const menuItems = await MenuItem.findAll({
      where: {
        user_id: req.user.id,
        is_active: true
      }
    });

    let totalMarginPercent = 0;
    let lowMarginItems = 0;

    menuItems.forEach(item => {
      const margin = item.price - item.cogs;
      const marginPercent = item.price > 0 ? (margin / item.price) * 100 : 0;
      totalMarginPercent += marginPercent;

      if (marginPercent < 30) {
        lowMarginItems++;
      }
    });

    const avgMarginPercent = menuItems.length > 0 ? totalMarginPercent / menuItems.length : 0;

    res.json({
      total_items: totalItems,
      active_items: activeItems,
      category_count: categories.length || 0,
      avg_margin_percent: avgMarginPercent.toFixed(2),
      low_margin_items: lowMarginItems
    });

  } catch (error) {
    console.error('Get menu stats error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil statistik menu.' });
  }
};

module.exports = {
  getAll: getAllMenuItems,
  getCategories: getMenuCategories,
  getById: getMenuItemById,
  create: createMenuItem,
  update: updateMenuItem,
  delete: deleteMenuItem,
  addCategory,
  deleteCategory,
  getMenuStats
};