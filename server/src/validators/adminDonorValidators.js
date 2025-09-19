const { body, validationResult } = require('express-validator');

const createDonorValidator = [
  body('organization_name').trim().notEmpty().withMessage('organization_name is required').bail(),
  body('email').normalizeEmail().isEmail().withMessage('Valid email is required').bail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('contact_person').optional().isLength({ min: 2 }).withMessage('contact_person is too short'),
  body('phone_number').optional().isLength({ min: 7, max: 15 }).withMessage('phone_number must be 7–15 characters'),
  body('pan_number').optional().isLength({ min: 8, max: 20 }).withMessage('pan_number looks invalid'),
  body('pincode').optional().isLength({ min: 4, max: 10 }).withMessage('pincode must be 4–10 characters'),
  body('total_contribution').optional().isFloat({ min: 0 }).withMessage('total_contribution must be >= 0'),
];

const updateDonorValidator = [
  body('organization_name').optional().notEmpty().withMessage('organization_name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('contact_person').optional().isLength({ min: 2 }),
  body('phone_number').optional().isLength({ min: 7, max: 15 }),
  body('pan_number').optional().isLength({ min: 8, max: 20 }),
  body('pincode').optional().isLength({ min: 4, max: 10 }),
  body('total_contribution').optional().isFloat({ min: 0 }),
];

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map(e => ({ field: e.path, message: e.msg || 'Invalid value' }));
  return res.status(422).json({ errors });
}

module.exports = { createDonorValidator, updateDonorValidator, validate };
