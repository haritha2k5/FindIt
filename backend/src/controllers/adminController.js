const { User, Item, Claim } = require('../models');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be user or admin' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }
    await user.update({ role });
    res.json({ success: true, message: `User role updated to ${role}`, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalItems, pendingItems, totalClaims, pendingClaims] = await Promise.all([
      User.count(),
      Item.count(),
      Item.count({ where: { is_approved: false } }),
      Claim.count(),
      Claim.count({ where: { status: 'pending' } }),
    ]);
    res.json({ success: true, stats: { totalUsers, totalItems, pendingItems, totalClaims, pendingClaims } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

module.exports = { getAllUsers, updateUserRole, getStats };
