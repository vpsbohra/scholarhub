const { body } = require('express-validator');

const userType = body('user_type')
  .isIn(['student', 'donor', 'admin'])
  .withMessage('user_type must be one of: student, donor, admin');

const email = body('email')
  .isEmail()
  .withMessage('Valid email is required');

const password = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

const registerValidator = [
  userType,
  email,
  password,

  // student-specific
  body('first_name')
    .if(body('user_type').equals('student'))
    .notEmpty().withMessage('first_name is required for student'),
  body('last_name')
    .if(body('user_type').equals('student'))
    .notEmpty().withMessage('last_name is required for student'),

  // donor-specific
  body('organization_name')
    .if(body('user_type').equals('donor'))
    .notEmpty().withMessage('organization_name is required for donor'),

  // admin-specific
  body('name')
    .if(body('user_type').equals('admin'))
    .notEmpty().withMessage('name is required for admin'),
];

const loginValidator = [
  userType,
  email,
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
