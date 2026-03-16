const express = require('express');
const router = express.Router();
const { getBalance, transfer, getTransactions, topUp, getAlleeSummary, getAnalytics } = require('../controllers/walletController');
const { auth, requireVerified, requireActiveWallet } = require('../middleware/auth');
const Joi = require('joi');

const transferSchema = Joi.object({
  receiverEmail: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(255)
});

const topupSchema = Joi.object({ amount: Joi.number().positive().required() });

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

router.get('/balance', auth, getBalance);
router.post('/transfer', auth, requireVerified, requireActiveWallet, validate(transferSchema), transfer);
router.get('/transactions', auth, getTransactions);
router.post('/topup', auth, requireVerified, requireActiveWallet, validate(topupSchema), topUp);
router.get('/allowee-summary', auth, getAlleeSummary);
router.get('/analytics', auth, getAnalytics);

module.exports = router;
