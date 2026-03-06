const express = require('express');
const router = express.Router();
const { getVaultBalance, lockFunds, unlockFunds } = require('../controllers/savingsController');
const { auth } = require('../middleware/auth');

router.get('/balance', auth, getVaultBalance);
router.post('/lock', auth, lockFunds);
router.post('/unlock', auth, unlockFunds);

module.exports = router;
