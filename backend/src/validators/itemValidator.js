const { body } = require('express-validator');

const createItemValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title too long'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('category')
    .notEmpty()
    .isIn(['electronics', 'clothing', 'documents', 'accessories', 'keys', 'bags', 'other'])
    .withMessage('Invalid category'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('date')
    .notEmpty()
    .isDate().withMessage('Valid date is required'),
  body('status')
    .notEmpty()
    .isIn(['lost', 'found']).withMessage('Status must be lost or found'),
];

module.exports = { createItemValidator };
