const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, forgotPassword, resetPassword, getProfile, updateProfile, changePassword, resendVerification } = require('../controllers/authController');
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

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .required()
  .messages({
    'string.pattern.base': 'Password must be at least 8 characters with uppercase, lowercase, and a number',
    'string.min': 'Password must be at least 8 characters with uppercase, lowercase, and a number'
  });

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
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
const resetSchema = Joi.object({ password: passwordSchema });
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetSchema), resetPassword);
router.post('/resend-verification', auth, authLimiter, resendVerification);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, validate(changePasswordSchema), changePassword);

module.exports = router;
