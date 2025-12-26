// routes/manufacturingRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');
const { checkAddon } = require('../middleware/addons');

// Import controllers
const inventoryController = require('../controllers/inventoryController');
const bomController = require('../controllers/bomController');
const productionController = require('../controllers/productionController');

// Semua route manufacturing membutuhkan addon manufacturing aktif
router.use(authenticate, checkLicense, checkAddon('manufacturing'));

// Inventory routes
router.get('/inventory', inventoryController.getAll);
router.get('/inventory/:id', inventoryController.getById);
router.post('/inventory', inventoryController.create);
router.put('/inventory/:id', inventoryController.update);
router.delete('/inventory/:id', inventoryController.delete);

// BOM routes
router.get('/bom', bomController.getAll);
router.get('/bom/:id', bomController.getById);
router.post('/bom', bomController.create);
router.put('/bom/:id', bomController.update);
router.delete('/bom/:id', bomController.delete);

// Production routes
router.get('/production', productionController.getAll);
router.get('/production/:id', productionController.getById);
router.post('/production', productionController.create);
router.put('/production/:id', productionController.update);
router.put('/production/:id/complete', productionController.completeOrder);
router.delete('/production/:id', productionController.delete);

module.exports = router;