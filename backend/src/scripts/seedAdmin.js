require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const sequelize = require('../config/database');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mamipay.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234!';
const ADMIN_FIRST_NAME = 'Mami';
const ADMIN_LAST_NAME = 'Admin';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const admin = await User.create({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true
    });

    await Wallet.create({ userId: admin.id });

    console.log(`✓ Admin created successfully`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Change this password after first login.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
