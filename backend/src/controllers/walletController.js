const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const sequelize = require('../config/database');
const { logAction } = require('../services/auditLogger');
const { sendTransferNotification } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/errorHandler');

const getBalance = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) wallet = await Wallet.create({ userId: req.user.id });
    res.json({ balance: wallet.balance, currency: wallet.currency, overdraftLimit: wallet.overdraftLimit, status: wallet.status });
  } catch (error) {
    next(error);
  }
};

const transfer = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { receiverEmail, amount, description } = req.body;
    const senderId = req.user.id;

    const sender = await User.findByPk(senderId, { transaction: t });
    const senderWallet = await Wallet.findOne({ where: { userId: senderId }, transaction: t });
    const receiver = await User.findOne({ where: { email: receiverEmail }, transaction: t });

    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }

    const receiverWallet = await Wallet.findOne({ where: { userId: receiver.id }, transaction: t });
    if (!receiverWallet) {
      throw new AppError('Receiver wallet not found', 404);
    }

    if (parseFloat(senderWallet.balance) + parseFloat(senderWallet.overdraftLimit) < parseFloat(amount)) {
      throw new AppError('Insufficient funds', 400);
    }

    senderWallet.balance = parseFloat(senderWallet.balance) - parseFloat(amount);
    receiverWallet.balance = parseFloat(receiverWallet.balance) + parseFloat(amount);

    await senderWallet.save({ transaction: t });
    await receiverWallet.save({ transaction: t });

    const transaction = await Transaction.create({
      senderId,
      receiverId: receiver.id,
      amount,
      type: 'transfer',
      status: 'completed',
      reference: `TRF-${uuidv4().substring(0, 8).toUpperCase()}`,
      description,
      category: 'Transfer'
    }, { transaction: t });

    await logAction(senderId, 'TRANSFER', 'Wallet', senderWallet.id, null, { amount, receiverId: receiver.id }, req);
    await t.commit();

    sendTransferNotification({
      senderEmail: sender.email,
      senderName: `${sender.firstName} ${sender.lastName}`,
      receiverEmail: receiver.email,
      receiverName: `${receiver.firstName} ${receiver.lastName}`,
      amount,
    }).catch(() => {});

    res.json({ message: 'Transfer successful', transaction });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { Op } = sequelize.Sequelize;

    const where = {
      [Op.or]: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    };

    if (req.query.type) where.type = req.query.type;
    if (req.query.category) where.category = req.query.category;
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
      if (req.query.endDate) where.createdAt[Op.lte] = new Date(req.query.endDate);
    }
    if (req.query.search) {
      where[Op.or].push({ description: { [Op.iLike]: `%${req.query.search}%` } });
      where[Op.or].push({ reference: { [Op.iLike]: `%${req.query.search}%` } });
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        { model: User, as: 'sender', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'receiver', attributes: ['firstName', 'lastName', 'email'] }
      ]
    });

    res.json({
      transactions,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};

const topUp = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
    await wallet.save();

    const transaction = await Transaction.create({
      senderId: req.user.id,
      receiverId: req.user.id,
      amount,
      type: 'top_up',
      status: 'completed',
      reference: `TOP-${uuidv4().substring(0, 8).toUpperCase()}`,
      description: 'Wallet top-up',
      category: 'Top-up'
    });

    res.json({ message: 'Top-up successful', balance: wallet.balance, transaction });
  } catch (error) {
    next(error);
  }
};

const getAlleeSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { Op } = sequelize.Sequelize;

    const result = await Transaction.sum('amount', {
      where: {
        receiverId: req.user.id,
        type: { [Op.in]: ['transfer', 'top_up'] },
        status: 'completed',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    const spent = await Transaction.sum('amount', {
      where: {
        senderId: req.user.id,
        status: 'completed',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    res.json({
      expected: 77000,
      received: parseFloat(result || 0),
      spent: parseFloat(spent || 0),
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months, 10) || 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const { Op } = sequelize.Sequelize;

    const allTransactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ],
        status: 'completed',
        createdAt: { [Op.gte]: startDate }
      },
      order: [['createdAt', 'ASC']]
    });

    const spendingByCategory = {};
    const monthlyMap = {};
    const monthsKeys = [];

    for (let i = months - 1; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthsKeys.push(key);
      monthlyMap[key] = { spent: 0, received: 0 };
    }

    let totalSpent = 0;
    let totalReceived = 0;

    allTransactions.forEach((tx) => {
      const monthKey = new Date(tx.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      const isSent = tx.senderId === req.user.id && tx.type !== 'top_up';
      const isReceived = tx.receiverId === req.user.id || tx.type === 'top_up';

      if (isSent) {
        totalSpent += parseFloat(tx.amount);
        const category = tx.category || 'Other';
        spendingByCategory[category] = (spendingByCategory[category] || 0) + parseFloat(tx.amount);
      }
      if (isReceived) {
        totalReceived += parseFloat(tx.amount);
      }

      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].spent += isSent ? parseFloat(tx.amount) : 0;
        monthlyMap[monthKey].received += isReceived ? parseFloat(tx.amount) : 0;
      }
    });

    const categoryData = Object.entries(spendingByCategory).map(([category, amount]) => ({ category, amount }));
    const monthlyData = monthsKeys.map((key) => ({ month: key, spent: monthlyMap[key].spent, received: monthlyMap[key].received }));

    res.json({
      totalSpent,
      totalReceived,
      spendingByCategory: categoryData,
      monthlyData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBalance, transfer, getTransactions, topUp, getAlleeSummary, getAnalytics };
