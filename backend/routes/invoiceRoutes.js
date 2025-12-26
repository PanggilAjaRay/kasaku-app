// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoicePaid
} = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');

router.use(authenticate, checkLicense);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.put('/:id/paid', markInvoicePaid);

module.exports = router;