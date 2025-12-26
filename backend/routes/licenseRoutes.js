// routes/licenseRoutes.js
const express = require('express');
const router = express.Router();
const { getLicense, updateAddon } = require('../controllers/licenseController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getLicense);
router.put('/addon', authenticate, updateAddon);

module.exports = router;