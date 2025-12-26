// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const { getAllClients, getClientById, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');
const { checkAddon } = require('../middleware/addons');

// Hanya bisa diakses jika plus_advance addon aktif
router.use(authenticate, checkLicense, checkAddon('plus_advance'));

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;