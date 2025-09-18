const { body, validationResult } = require('express-validator');

const createStudentValidator = [
  body('first_name').trim().notEmpty().withMessage('first_name is required').bail(),
  body('last_name').trim().notEmpty().withMessage('last_name is required').bail(),
  body('email').normalizeEmail().isEmail().withMessage('Valid email is required').bail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('phone_number')
    .optional()
    .isLength({ min: 7, max: 15 })
    .withMessage('phone_number must be 7–15 characters'),
  body('dob').optional().isISO8601().withMessage('dob must be YYYY-MM-DD'),
  body('gender').optional().isIn(['Male','Female','Other']).withMessage('gender must be Male, Female, or Other'),
  body('annual_income').optional().isFloat({ min: 0 }).withMessage('annual_income must be a positive number'),
  body('category').optional().isIn(['General','OBC','SC','ST','Other']).withMessage('category is invalid'),
  body('pincode').optional().isLength({ min: 4, max: 10 }).withMessage('pincode must be 4–10 characters'),
  body('status').optional().isIn(['pending','verified','rejected','inactive']).withMessage('status is invalid'),
];

// NEW: return field-level errors for AntD
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map(e => ({
    field: e.path,                // field name
    message: e.msg || 'Invalid value',
  }));
  return res.status(422).json({ errors });
}

module.exports = { createStudentValidator, validate };
