const express = require('express');
const router = express.Router();
const {
  createItem, getItems, getItemById,
  updateItem, deleteItem, approveItem, getPendingItems, getMyItems,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createItemValidator } = require('../validators/itemValidator');

// Public
router.get('/', getItems);

// Must come before /:id
router.get('/admin/pending', protect, requireRole('admin'), getPendingItems);
router.get('/my', protect, getMyItems);

// Public - single item
router.get('/:id', getItemById);

// Protected
router.post('/', protect, upload.single('image'), createItemValidator, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

// Admin
router.patch('/:id/approve', protect, requireRole('admin'), approveItem);

module.exports = router;
