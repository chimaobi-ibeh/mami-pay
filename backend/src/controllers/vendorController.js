const QRCode = require('qrcode');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getVendorQR = async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can generate QR codes' });
    }
    const paymentUrl = `${process.env.APP_URL}/pay/vendor/${req.user.id}`;
    const qrDataUrl = await QRCode.toDataURL(paymentUrl, { width: 300, margin: 2 });
    res.json({ qr: qrDataUrl, url: paymentUrl, vendorId: req.user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'shopName', 'shopCategory', 'shopDescription']
    });
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    const { count, rows } = await Transaction.findAndCountAll({
      where: { receiverId: req.user.id, status: 'completed' },
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    res.json({
      vendor,
      totalSales: count,
      balance: wallet?.balance || 0,
      recentSales: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Used when corps member pays a vendor via QR
const payVendor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { vendorId, amount, description } = req.body;
    const senderId = req.user.id;

    if (senderId === vendorId) {
      throw new Error('Cannot pay yourself');
    }

    const vendor = await User.findByPk(vendorId, { transaction: t });
    if (!vendor || vendor.role !== 'vendor') {
      throw new Error('Vendor not found');
    }

    const senderWallet = await Wallet.findOne({ where: { userId: senderId }, transaction: t });
    const vendorWallet = await Wallet.findOne({ where: { userId: vendorId }, transaction: t });

    if (!senderWallet || parseFloat(senderWallet.balance) + parseFloat(senderWallet.overdraftLimit) < parseFloat(amount)) {
      throw new Error('Insufficient funds');
    }

    senderWallet.balance = parseFloat(senderWallet.balance) - parseFloat(amount);
    vendorWallet.balance = parseFloat(vendorWallet.balance) + parseFloat(amount);

    await senderWallet.save({ transaction: t });
    await vendorWallet.save({ transaction: t });

    const transaction = await Transaction.create({
      senderId,
      receiverId: vendorId,
      amount,
      type: 'vendor_payment',
      status: 'completed',
      reference: `VND-${uuidv4().substring(0, 8).toUpperCase()}`,
      description: description || `Payment to ${vendor.shopName || vendor.firstName + "'s store"}`,
      category: 'Food & Shopping'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Payment successful', transaction, vendorName: `${vendor.firstName} ${vendor.lastName}` });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
};

const getVendorPublicInfo = async (req, res) => {
  try {
    const vendor = await User.findByPk(req.params.vendorId, {
      attributes: ['id', 'firstName', 'lastName', 'shopName', 'shopCategory', 'shopDescription']
    });
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    const { shopName, shopCategory, shopDescription } = req.body;
    await User.update({ shopName, shopCategory, shopDescription }, { where: { id: req.user.id } });
    res.json({ message: 'Store profile updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getVendorQR, getVendorProfile, payVendor, getVendorPublicInfo, updateVendorProfile };
