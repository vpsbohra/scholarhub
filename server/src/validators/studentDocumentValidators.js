const { body, param, validationResult } = require('express-validator');

const uploadRules = [
  body('doc_type').isIn(['id_proof','address_proof','education']).withMessage('doc_type invalid'),
  body('title').optional().isLength({ max: 200 }).withMessage('title too long'),
];

const idParam = [ param('id').isInt({ min:1 }).withMessage('invalid id') ];
const studentIdParam = [ param('studentId').isInt({ min:1 }).withMessage('invalid studentId') ];

const statusRules = [
  body('status').isIn(['pending','approved','rejected']).withMessage('status invalid'),
  body('remarks').optional().isLength({ max: 255 }),
];

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map(e => ({ field: e.path, message: e.msg || 'Invalid value' }));
  return res.status(422).json({ errors });
}

module.exports = { uploadRules, idParam, studentIdParam, statusRules, validate };
