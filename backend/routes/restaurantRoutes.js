// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');
const { checkAddon } = require('../middleware/addons');

// Import controllers
const menuController = require('../controllers/menuController');
const posController = require('../controllers/posController');

// Semua route restaurant membutuhkan addon restaurant aktif
router.use(authenticate, checkLicense, checkAddon('restaurant'));

// Menu routes
router.get('/menu', menuController.getAll);
router.get('/menu/categories', menuController.getCategories);
router.get('/menu/:id', menuController.getById);
router.post('/menu', menuController.create);
router.put('/menu/:id', menuController.update);
router.delete('/menu/:id', menuController.delete);
router.post('/menu/categories', menuController.addCategory);
router.delete('/menu/categories/:name', menuController.deleteCategory);

// POS routes
router.get('/pos/orders', posController.getAllOrders);
router.get('/pos/orders/:id', posController.getOrderById);
router.post('/pos/orders', posController.createOrder);
router.get('/pos/receipt/:id', posController.getReceipt);

module.exports = router;