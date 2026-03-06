const express = require('express');
const router = express.Router();
const { getVendorQR, getVendorProfile, payVendor, getVendorPublicInfo } = require('../controllers/vendorController');
const { auth } = require('../middleware/auth');
const Joi = require('joi');

const paySchema = Joi.object({
  vendorId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(255)
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

router.get('/qr', auth, getVendorQR);
router.get('/profile', auth, getVendorProfile);
router.post('/pay', auth, validate(paySchema), payVendor);
router.get('/info/:vendorId', getVendorPublicInfo); // public — used by QR scan page

module.exports = router;
