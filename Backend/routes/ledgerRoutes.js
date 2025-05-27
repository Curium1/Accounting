// backend/routes/ledgerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAccount,
  getAccounts,
  createLedgerEntry,
  getLedgerEntries,
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/authMiddleware'); // JWT protection

// Account Routes
router.route('/accounts').post(protect, createAccount).get(protect, getAccounts);

// Ledger Entry Routes
router.route('/ledger-entries').post(protect, createLedgerEntry).get(protect, getLedgerEntries);

module.exports = router;
