const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const sequelize = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return next(new AppError('Admin access required', 403));
  next();
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search
      ? {
          [sequelize.Sequelize.Op.or]: [
            { firstName: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
            { lastName: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
            { email: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } }
          ]
        }
      : {};

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'nyscServiceNumber', 'isVerified', 'createdAt'],
      include: [{ model: Wallet, attributes: ['balance', 'overdraftLimit', 'status'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({ users, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

const setOverdraftLimit = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit } = req.body;

    if (parseFloat(limit) < 0) return next(new AppError('Limit cannot be negative', 400));

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) return next(new AppError('Wallet not found', 404));

    wallet.overdraftLimit = parseFloat(limit);
    await wallet.save();

    res.json({ message: 'Overdraft limit updated', overdraftLimit: wallet.overdraftLimit });
  } catch (error) {
    next(error);
  }
};

const setWalletStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const valid = ['active', 'suspended', 'closed'];
    if (!valid.includes(status)) {
      return next(new AppError('Status must be active, suspended, or closed', 400));
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) return next(new AppError('Wallet not found', 404));

    wallet.status = status;
    await wallet.save();

    res.json({ message: 'Wallet status updated', status: wallet.status });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTransactions] = await Promise.all([
      User.count(),
      Transaction.count()
    ]);
    res.json({ totalUsers, totalTransactions });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { action, userId, startDate, endDate } = req.query;
    const { Op } = sequelize.Sequelize;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({ logs: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAdmin, getAllUsers, setOverdraftLimit, setWalletStatus, getStats, getAuditLogs };
