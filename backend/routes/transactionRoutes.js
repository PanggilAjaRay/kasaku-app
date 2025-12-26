// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');

// Semua route transaksi membutuhkan autentikasi dan lisensi aktif
router.use(authenticate, checkLicense);

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;