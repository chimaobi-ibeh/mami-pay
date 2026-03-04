const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const sequelize = require('../config/database');
const { logAction } = require('../services/auditLogger');
const { v4: uuidv4 } = require('uuid');

const getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
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
    res.json({ message: 'Transfer successful', transaction });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['firstName', 'lastName', 'email'] },
        { model: User, as: 'receiver', attributes: ['firstName', 'lastName', 'email'] }
      ]
    });
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getBalance, transfer, getTransactions };
