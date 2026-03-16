const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logAction } = require('../services/auditLogger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { AppError } = require('../middleware/errorHandler');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber, nyscServiceNumber } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    if (nyscServiceNumber) {
      const existingNysc = await User.findOne({ where: { nyscServiceNumber } });
      if (existingNysc) {
        return next(new AppError('This NYSC service number is already registered', 400));
      }
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'corper',
      phoneNumber,
      nyscServiceNumber: nyscServiceNumber || null,
      emailVerificationToken,
    });

    await Wallet.create({ userId: user.id });
    await logAction(user.id, 'REGISTER', 'User', user.id, null, { email, role }, req);

    sendVerificationEmail(email, firstName, emailVerificationToken).catch(() => {});

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      user: { id: user.id, firstName, lastName, email, role: user.role, isVerified: false },
      token,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid login credentials', 401));
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    await logAction(user.id, 'LOGIN', 'User', user.id, null, null, req);

    res.json({
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isVerified: user.isVerified },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { emailVerificationToken: token } });

    if (!user) {
      return next(new AppError('Invalid or expired verification link.', 400));
    }

    await user.update({ isVerified: true, emailVerificationToken: null });
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    if (user.isVerified) {
      return res.json({ message: 'Email already verified.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await user.update({ emailVerificationToken: token });
    await sendVerificationEmail(user.email, user.firstName, token);

    res.json({ message: 'Verification email resent.' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({ passwordResetToken: resetToken, passwordResetExpires: expires });
    sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(() => {});

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return next(new AppError('Invalid or expired reset link.', 400));
    }

    await user.update({ password, passwordResetToken: null, passwordResetExpires: null });
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber', 'nyscServiceNumber', 'callUpDate', 'shopName', 'shopCategory', 'isVerified']
    });
    if (!user) return next(new AppError('User not found', 404));
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, callUpDate } = req.body;
    await User.update({ firstName, lastName, phoneNumber, callUpDate }, { where: { id: req.user.id } });
    res.json({ message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect.', 401));
    }
    await user.update({ password: newPassword });
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, verifyEmail, resendVerification, forgotPassword, resetPassword, getProfile, updateProfile, changePassword };
