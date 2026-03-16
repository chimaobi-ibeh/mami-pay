const express = require('express');
const router = express.Router();
const { requireAdmin, getAllUsers, setOverdraftLimit, setWalletStatus, getStats, getAuditLogs } = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

router.use(auth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/overdraft', setOverdraftLimit);
router.put('/users/:userId/wallet-status', setWalletStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
