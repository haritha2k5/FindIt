const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Claim = sequelize.define('Claim', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  item_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  claimant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'claims',
  timestamps: true,
});

module.exports = Claim;
