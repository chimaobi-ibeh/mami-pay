const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('transfer', 'deposit', 'withdrawal', 'payroll', 'overdraft', 'vendor_payment', 'top_up'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'reversed'),
    defaultValue: 'pending'
  },
  reference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

User.hasMany(Transaction, { as: 'sentTransactions', foreignKey: 'senderId' });
User.hasMany(Transaction, { as: 'receivedTransactions', foreignKey: 'receiverId' });
Transaction.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Transaction.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = Transaction;
