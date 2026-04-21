const { Claim, Item, User } = require('../models');
const logger = require('../config/logger');

// @POST /api/claims/:itemId
const createClaim = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { message } = req.body;

    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (!item.is_approved) {
      return res.status(400).json({ success: false, message: 'Item is not approved yet' });
    }

    // BUG FIX: original code blocked claims on lost items with:
    //   if (item.status !== 'found') return error
    // This is wrong. Both lost and found items can be claimed:
    //   - FOUND item: someone else lost it and wants to claim it back
    //   - LOST item: someone found it and wants to report that they have it
    // Only truly claimed (already resolved) items should block new claims.
    if (item.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'This item has already been claimed' });
    }

    if (item.user_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    const existingClaim = await Claim.findOne({
      where: { item_id: itemId, claimant_id: req.user.id },
    });
    if (existingClaim) {
      return res.status(409).json({ success: false, message: 'You already submitted a claim for this item' });
    }

    const claim = await Claim.create({
      item_id: itemId,
      claimant_id: req.user.id,
      message,
      status: 'pending',
    });

    logger.info('Claim created', { claimId: claim.id, itemId, userId: req.user.id });
    res.status(201).json({ success: true, message: 'Claim submitted successfully', claim });
  } catch (error) {
    logger.error('Create claim error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to submit claim' });
  }
};

// @GET /api/claims/my
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.findAll({
      where: { claimant_id: req.user.id },
      include: [{ model: Item, as: 'item', attributes: ['id', 'title', 'status', 'image_url'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch claims' });
  }
};

// @GET /api/claims/item/:itemId
const getClaimsForItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const claims = await Claim.findAll({
      where: { item_id: req.params.itemId },
      include: [{ model: User, as: 'claimant', attributes: ['id', 'name', 'email'] }],
    });

    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch claims' });
  }
};

// @GET /api/claims  (admin)
const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.findAll({
      include: [
        { model: Item, as: 'item', attributes: ['id', 'title', 'status'] },
        { model: User, as: 'claimant', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all claims' });
  }
};

// @PATCH /api/claims/:id  (admin)
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const claim = await Claim.findByPk(req.params.id, {
      include: [{ model: Item, as: 'item' }],
    });

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    await claim.update({ status });

    // When a claim is approved, mark the item as claimed so no new claims come in
    if (status === 'approved') {
      await claim.item.update({ status: 'claimed' });
    }

    res.json({ success: true, message: `Claim ${status}`, claim });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update claim' });
  }
};

module.exports = { createClaim, getMyClaims, getClaimsForItem, getAllClaims, updateClaimStatus };
