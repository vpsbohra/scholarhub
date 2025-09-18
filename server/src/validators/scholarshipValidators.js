const { body, query, validationResult } = require('express-validator');

const createRules = [
  body('scholarship_name').notEmpty().withMessage('name required'),
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be > 0'),
  body('start_date').isISO8601().withMessage('start_date must be YYYY-MM-DD'),
  body('end_date').isISO8601().withMessage('end_date must be YYYY-MM-DD'),
  body('status').optional().isIn(['draft','active','closed','archived']),
  body('donor_id').optional().isInt({ min: 1 }),
];

const updateRules = [
  body('scholarship_name').optional().notEmpty(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body('status').optional().isIn(['draft','active','closed','archived']),
  body('donor_id').optional().isInt({ min:1 }),
];

const listRules = [
  query('search').optional().isString(),
  query('status').optional().isIn(['draft','active','closed','archived']),
  query('page').optional().isInt({ min:1 }),
  query('pageSize').optional().isInt({ min:1, max:100 }),
  query('owner').optional().isIn(['me']),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new Error(errors.array()[0].msg));
  next();
}

module.exports = { createRules, updateRules, listRules, handleValidation };
