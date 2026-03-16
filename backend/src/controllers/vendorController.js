const QRCode = require('qrcode');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/errorHandler');

const getVendorQR = async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return next(new AppError('Only vendors can generate QR codes', 403));
    }
    const paymentUrl = `${process.env.APP_URL}/pay/vendor/${req.user.id}`;
    const qrDataUrl = await QRCode.toDataURL(paymentUrl, { width: 300, margin: 2 });
    res.json({ qr: qrDataUrl, url: paymentUrl, vendorId: req.user.id });
  } catch (error) {
    next(error);
  }
};

const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'shopName', 'shopCategory', 'shopDescription']
    });
    if (!vendor) return next(new AppError('Vendor not found', 404));
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
    next(error);
  }
};

const payVendor = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { vendorId, amount, description } = req.body;
    const senderId = req.user.id;

    if (senderId === vendorId) {
      throw new AppError('Cannot pay yourself', 400);
    }

    const vendor = await User.findByPk(vendorId, { transaction: t });
    if (!vendor || vendor.role !== 'vendor') {
      throw new AppError('Vendor not found', 404);
    }

    const senderWallet = await Wallet.findOne({ where: { userId: senderId }, transaction: t });
    const vendorWallet = await Wallet.findOne({ where: { userId: vendorId }, transaction: t });

    if (!senderWallet || parseFloat(senderWallet.balance) + parseFloat(senderWallet.overdraftLimit) < parseFloat(amount)) {
      throw new AppError('Insufficient funds', 400);
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
    next(error);
  }
};

const getVendorPublicInfo = async (req, res, next) => {
  try {
    const vendor = await User.findByPk(req.params.vendorId, {
      attributes: ['id', 'firstName', 'lastName', 'shopName', 'shopCategory', 'shopDescription']
    });
    if (!vendor || vendor.role !== 'vendor') {
      return next(new AppError('Vendor not found', 404));
    }
    res.json({ vendor });
  } catch (error) {
    next(error);
  }
};

const listVendors = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(10, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const { Op } = sequelize.Sequelize;

    const where = { role: 'vendor' };
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { shopName: { [Op.iLike]: `%${search}%` } },
        { shopDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) {
      where.shopCategory = { [Op.iLike]: `%${category}%` };
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'shopName', 'shopCategory', 'shopDescription', 'email'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({ vendors: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

const updateVendorProfile = async (req, res, next) => {
  try {
    const { shopName, shopCategory, shopDescription } = req.body;
    await User.update({ shopName, shopCategory, shopDescription }, { where: { id: req.user.id } });
    res.json({ message: 'Store profile updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVendorQR, getVendorProfile, payVendor, getVendorPublicInfo, listVendors, updateVendorProfile };
