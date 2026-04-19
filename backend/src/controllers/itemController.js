const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Item, User, Claim } = require('../models');
const logger = require('../config/logger');
const { uploadToSupabase } = require('../utils/supabaseStorage');

// @POST /api/items
const createItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, category, location, date, status } = req.body;

    let image_url = null;
    if (req.file) {
      if (req.file.buffer) {
        // Handled by Supabase memory storage
        image_url = await uploadToSupabase(req.file);
      } else {
        // Local disk storage
        image_url = `/uploads/${req.file.filename}`;
      }
    }


    const item = await Item.create({
      title, description, category, location, date, status,
      image_url,
      user_id: req.user.id,
      is_approved: false,
    });

    logger.info('Item created', { itemId: item.id, userId: req.user.id });
    res.status(201).json({ success: true, message: 'Item posted. Awaiting admin approval.', item });
  } catch (error) {
    logger.error('Create item error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create item' });
  }
};

// @GET /api/items
const getItems = async (req, res) => {
  try {
    const { category, status, location, date, search, page = 1, limit = 10 } = req.query;
    const where = { is_approved: true };

    if (category) where.category = category;
    if (status) where.status = status;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (date) where.date = date;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: items } = await Item.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      items,
    });
  } catch (error) {
    logger.error('Get items error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
};

// @GET /api/items/admin/pending  — must be BEFORE /:id route
const getPendingItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { is_approved: false },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending items' });
  }
};

// @GET /api/items/:id
const getItemById = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        {
          model: Claim,
          as: 'claims',
          include: [{ model: User, as: 'claimant', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch item' });
  }
};

// @PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, category, location, date, status } = req.body;
    await item.update({ title, description, category, location, date, status });
    res.json({ success: true, message: 'Item updated', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update item' });
  }
};

// @DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.destroy();
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
};

// @PATCH /api/items/:id/approve
const approveItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    await item.update({ is_approved: true });
    res.json({ success: true, message: 'Item approved', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve item' });
  }
};

// GET /api/items/my  — items posted by the logged-in user
const getMyItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your items' });
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem, approveItem, getPendingItems, getMyItems };
