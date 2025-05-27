const express = require('express');
const { initiateBankIdSignup, completeBankIdSignup } = require('../controllers/bankIdController');

const router = express.Router();

// @route   POST /api/bankid/initiate-signup
// @desc    Initiate BankID signup process (mocked)
// @access  Public
router.post('/initiate-signup', initiateBankIdSignup);

// @route   POST /api/bankid/complete-signup
// @desc    Complete BankID signup process and create user
// @access  Public
router.post('/complete-signup', completeBankIdSignup);

module.exports = router;
