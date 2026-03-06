const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const SavingsVault = sequelize.define('SavingsVault', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' }
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  }
});

User.hasOne(SavingsVault, { foreignKey: 'userId' });
SavingsVault.belongsTo(User, { foreignKey: 'userId' });

module.exports = SavingsVault;
