const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const { logAction } = require('../services/auditLogger');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      phoneNumber
    });

    // Create wallet for new user
    await Wallet.create({ userId: user.id });

    await logAction(user.id, 'REGISTER', 'User', user.id, null, { email, role }, req);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '24h' });

    res.status(201).json({ user: { id: user.id, firstName, lastName, email, role }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '24h' });

    await logAction(user.id, 'LOGIN', 'User', user.id, null, null, req);

    res.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login };
