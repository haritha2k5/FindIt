const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [3, 150] },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('electronics', 'clothing', 'documents', 'accessories', 'keys', 'bags', 'other'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // BUG FIX: status ENUM was ('pending','approved','rejected','claimed') which
  // doesn't include 'lost' or 'found'. Frontend sends 'lost'/'found', causing
  // Sequelize to throw a DB-level error → "Failed to create item".
  // Correct values: lost, found, claimed.
  // is_approved handles the approval workflow separately.
  status: {
    type: DataTypes.ENUM('lost', 'found', 'claimed'),
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contact_info: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'items',
  timestamps: true,
});

module.exports = Item;
