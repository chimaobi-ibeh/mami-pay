const SavingsVault = require('../models/SavingsVault');
const Wallet = require('../models/Wallet');
const sequelize = require('../config/database');

const getVaultBalance = async (req, res) => {
  try {
    let vault = await SavingsVault.findOne({ where: { userId: req.user.id } });
    if (!vault) vault = await SavingsVault.create({ userId: req.user.id });
    res.json({ balance: vault.balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const lockFunds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    const wallet = await Wallet.findOne({ where: { userId: req.user.id }, transaction: t });
    if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new Error('Insufficient wallet balance');
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
    res.status(400).json({ error: error.message });
  }
};

const unlockFunds = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount');

    const vault = await SavingsVault.findOne({ where: { userId: req.user.id }, transaction: t });
    if (!vault || parseFloat(vault.balance) < parseFloat(amount)) {
      throw new Error('Insufficient vault balance');
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id }, transaction: t });

    vault.balance = parseFloat(vault.balance) - parseFloat(amount);
    wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);

    await vault.save({ transaction: t });
    await wallet.save({ transaction: t });
    await t.commit();

    res.json({ message: 'Funds unlocked from vault', vaultBalance: vault.balance, walletBalance: wallet.balance });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getVaultBalance, lockFunds, unlockFunds };
