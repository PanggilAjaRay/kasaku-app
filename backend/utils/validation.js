// utils/validation.js
const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter.')
];

const validateTransaction = [
  body('date')
    .isDate()
    .withMessage('Tanggal tidak valid.'),
  body('description')
    .notEmpty()
    .withMessage('Deskripsi wajib diisi.'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Jumlah harus angka positif.'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipe harus income atau expense.')
];

const validateInvoice = [
  body('customer_name')
    .notEmpty()
    .withMessage('Nama customer wajib diisi.'),
  body('due_date')
    .isDate()
    .withMessage('Tanggal jatuh tempo tidak valid.'),
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount harus angka positif.')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateLogin,
  validateTransaction,
  validateInvoice,
  handleValidationErrors
};