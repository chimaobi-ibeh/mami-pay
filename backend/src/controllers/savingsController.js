const SavingsVault = require('../models/SavingsVault');
const Wallet = require('../models/Wallet');
const sequelize = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const getVaultBalance = async (req, res, next) => {
  try {
    let vault = await SavingsVault.findOne({ where: { userId: req.user.id } });
    if (!vault) vault = await SavingsVault.create({ userId: req.user.id });
    res.json({ balance: vault.balance });
  } catch (error) {
    next(error);
  }
};

const lockFunds = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) return next(new AppError('Invalid amount', 400));

    const wallet = await Wallet.findOne({ where: { userId: req.user.id }, transaction: t });
    if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    let vault = await SavingsVault.findOne({ where: { userId: req.user.id }, transaction: t });
    if (!vault) vault = await SavingsVault.create({ userId: req.user.id }, { transaction: t });

    wallet.balance = parseFloat(wallet.balance) - parseFloat(amount);
    vault.balance = parseFloat(vault.balance) + parseFloat(amount);

    await wallet.save({ transaction: t });
    await vault.save({ transaction: t });
    await t.commit();

    res.json({ message: 'Funds locked in vault', vaultBalance: vault.balance, walletBalance: wallet.balance });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const unlockFunds = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) return next(new AppError('Invalid amount', 400));

    const vault = await SavingsVault.findOne({ where: { userId: req.user.id }, transaction: t });
    if (!vault || parseFloat(vault.balance) < parseFloat(amount)) {
      throw new AppError('Insufficient vault balance', 400);
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id }, transaction: t });
    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    vault.balance = parseFloat(vault.balance) - parseFloat(amount);
    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);

    await vault.save({ transaction: t });
    await wallet.save({ transaction: t });
    await t.commit();

    res.json({ message: 'Funds unlocked from vault', vaultBalance: vault.balance, walletBalance: wallet.balance });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = { getVaultBalance, lockFunds, unlockFunds };
