const express = require('express');
const router = express.Router();
const { requireAdmin, getAllUsers, setOverdraftLimit, getStats } = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

router.use(auth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/overdraft', setOverdraftLimit);

module.exports = router;
