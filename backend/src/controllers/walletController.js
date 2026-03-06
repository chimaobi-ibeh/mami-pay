const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const sequelize = require('../config/database');
const { logAction } = require('../services/auditLogger');
const { sendTransferNotification } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

const getBalance = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user.id });
    }
    res.json({ balance: wallet.balance, currency: wallet.currency, overdraftLimit: wallet.overdraftLimit });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const transfer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { receiverEmail, amount, description } = req.body;
    const senderId = req.user.id;

    const sender = await User.findByPk(senderId, { transaction: t });
    const senderWallet = await Wallet.findOne({ where: { userId: senderId }, transaction: t });
    const receiver = await User.findOne({ where: { email: receiverEmail }, transaction: t });

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    const receiverWallet = await Wallet.findOne({ where: { userId: receiver.id }, transaction: t });

    if (parseFloat(senderWallet.balance) + parseFloat(senderWallet.overdraftLimit) < parseFloat(amount)) {
      throw new Error('Insufficient funds');
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
      description
    }, { transaction: t });

    await logAction(senderId, 'TRANSFER', 'Wallet', senderWallet.id, null, { amount, receiverId: receiver.id }, req);
    await t.commit();

    // Email notifications (non-blocking)
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
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
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
    res.status(400).json({ error: error.message });
  }
};

const topUp = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
    await wallet.save();

    await Transaction.create({
      senderId: req.user.id,
      receiverId: req.user.id,
      amount,
      type: 'top_up',
      status: 'completed',
      reference: `TOP-${uuidv4().substring(0, 8).toUpperCase()}`,
      description: 'Wallet top-up'
    });

    res.json({ message: 'Top-up successful', balance: wallet.balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAlleeSummary = async (req, res) => {
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
      expected: 33000,
      received: parseFloat(result || 0),
      spent: parseFloat(spent || 0),
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getBalance, transfer, getTransactions, topUp, getAlleeSummary };
