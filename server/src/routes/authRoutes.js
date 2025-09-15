// server/src/routes/authRoutes.js
const express = require('express');
const ctrl = require('../controllers/authController');
const { auth, allowRoles } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { validationResult } = require('express-validator');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array()[0].msg || 'Validation failed';
    return next(new Error(msg));
  }
  next();
}

router.post('/auth/register', registerValidator, handleValidation, ctrl.register); // <- ctrl.register (no ())
router.post('/auth/login',    loginValidator,    handleValidation, ctrl.login);    // <- ctrl.login (no ())
router.get('/auth/me', auth, ctrl.me);                                            // <- ctrl.me (no ())
router.post('/auth/google', ctrl.google);
// examples (optional)
// router.get('/dashboard/student', auth, allowRoles('student'), (req,res)=>res.json({ok:true}));
// router.get('/dashboard/donor',   auth, allowRoles('donor'),   (req,res)=>res.json({ok:true}));
// router.get('/dashboard/admin',   auth, allowRoles('admin','superadmin'), (req,res)=>res.json({ok:true}));

module.exports = router;
