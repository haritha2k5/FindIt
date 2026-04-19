const express = require('express');
const router = express.Router();
const {
  createClaim, getMyClaims, getClaimsForItem, getAllClaims, updateClaimStatus,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All claim routes require login
router.use(protect);

router.get('/my', getMyClaims);
router.get('/item/:itemId', getClaimsForItem);
router.post('/:itemId', createClaim);

// Admin only
router.get('/', requireRole('admin'), getAllClaims);
router.patch('/:id', requireRole('admin'), updateClaimStatus);

module.exports = router;
