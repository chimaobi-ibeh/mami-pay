const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const sequelize = require('../config/database');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'nyscServiceNumber', 'isVerified', 'createdAt'],
      include: [{ model: Wallet, attributes: ['balance', 'overdraftLimit', 'status'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setOverdraftLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.body;

    if (parseFloat(limit) < 0) return res.status(400).json({ error: 'Limit cannot be negative' });

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    wallet.overdraftLimit = parseFloat(limit);
    await wallet.save();

    res.json({ message: 'Overdraft limit updated', overdraftLimit: wallet.overdraftLimit });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalTransactions] = await Promise.all([
      User.count(),
      Transaction.count()
    ]);
    res.json({ totalUsers, totalTransactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { requireAdmin, getAllUsers, setOverdraftLimit, getStats };
