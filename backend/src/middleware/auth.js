const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { AppError } = require('./errorHandler');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new AppError('Please authenticate', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return next(new AppError('Please authenticate', 401));
  }
};

const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Email verification required to perform this action', 403));
  }
  next();
};

const requireActiveWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet || wallet.status !== 'active') {
      return next(new AppError('Your wallet is suspended/closed', 403));
    }
    req.wallet = wallet;
    next();
  } catch (error) {
    next(new AppError('Unable to verify wallet status', 500));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }
    next();
  };
};

module.exports = { auth, authorize, requireVerified, requireActiveWallet };
