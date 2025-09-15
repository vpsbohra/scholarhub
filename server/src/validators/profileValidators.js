const { body, validationResult } = require('express-validator');

const studentUpdateValidator = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone_number').optional().isLength({ min: 7, max: 15 }).withMessage('Invalid phone'),
  body('dob').optional().isISO8601().withMessage('dob must be YYYY-MM-DD'),
  body('gender').optional().isIn(['Male','Female','Other']),
  body('annual_income').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['General','OBC','SC','ST','Other']),
  body('aadhar_number').optional().isLength({ min: 12, max: 12 }).withMessage('Aadhar must be 12 characters'),
  body('pincode').optional().isLength({ min: 4, max: 10 }),
  body('ifsc_code').optional().isLength({ min: 4, max: 15 }),
];

const donorUpdateValidator = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phone_number').optional().isLength({ min: 7, max: 15 }),
  body('pincode').optional().isLength({ min: 4, max: 10 }),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new Error(errors.array()[0].msg));
  next();
}

module.exports = { studentUpdateValidator, donorUpdateValidator, handleValidation };
