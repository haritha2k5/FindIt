const User = require('./User');
const Item = require('./Item');
const Claim = require('./Claim');

// Associations
User.hasMany(Item, { foreignKey: 'user_id', as: 'items' });
Item.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

User.hasMany(Claim, { foreignKey: 'claimant_id', as: 'claims' });
Claim.belongsTo(User, { foreignKey: 'claimant_id', as: 'claimant' });

Item.hasMany(Claim, { foreignKey: 'item_id', as: 'claims' });
Claim.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

module.exports = { User, Item, Claim };
