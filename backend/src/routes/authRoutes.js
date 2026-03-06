const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, forgotPassword, resetPassword, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'vendor', 'corper').default('corper'),
  phoneNumber: Joi.string().allow(''),
  nyscServiceNumber: Joi.when('role', {
    is: 'corper',
    then: Joi.string().required().messages({ 'any.required': 'NYSC service number is required for corps members.' }),
    otherwise: Joi.string().allow('', null).optional()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const forgotSchema = Joi.object({ email: Joi.string().email().required() });
const resetSchema = Joi.object({ password: Joi.string().min(6).required() });

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetSchema), resetPassword);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
