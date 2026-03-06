const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logAction } = require('../services/auditLogger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      phoneNumber,
      emailVerificationToken,
    });

    await Wallet.create({ userId: user.id });
    await logAction(user.id, 'REGISTER', 'User', user.id, null, { email, role }, req);

    // Send verification email (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(email, firstName, emailVerificationToken).catch(() => {});

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      user: { id: user.id, firstName, lastName, email, role: user.role, isVerified: false },
      token,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    await logAction(user.id, 'LOGIN', 'User', user.id, null, null, req);

    res.json({
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isVerified: user.isVerified },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { emailVerificationToken: token } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }

    await user.update({ isVerified: true, emailVerificationToken: null });
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ passwordResetToken: resetToken, passwordResetExpires: expires });
    sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(() => {});

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { passwordResetToken: token } });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset link.' });
    }

    await user.update({ password, passwordResetToken: null, passwordResetExpires: null });
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
