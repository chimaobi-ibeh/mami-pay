const express = require('express');
const router = express.Router();
const { getVaultBalance, lockFunds, unlockFunds } = require('../controllers/savingsController');
const { auth, requireVerified, requireActiveWallet } = require('../middleware/auth');

router.get('/balance', auth, getVaultBalance);
router.post('/lock', auth, requireVerified, requireActiveWallet, lockFunds);
router.post('/unlock', auth, requireVerified, requireActiveWallet, unlockFunds);

module.exports = router;
