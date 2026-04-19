const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All admin routes require login + admin role
router.use(protect, requireRole('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/stats', getStats);

module.exports = router;
