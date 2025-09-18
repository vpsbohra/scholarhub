const express = require('express');
const ctrl = require('../controllers/scholarshipController');
const { auth, allowRoles } = require('../middleware/auth');
const { createRules, updateRules, listRules, handleValidation } = require('../validators/scholarshipValidators');

const router = express.Router();

// public list can be auth-optional; we’ll keep it authed to read role for donor owner=me
router.get('/scholarships', auth, listRules, handleValidation, ctrl.list);
router.get('/scholarships/:id', auth, ctrl.getById);

// manage
router.post('/scholarships',     auth, allowRoles('admin','superadmin','donor'), createRules, handleValidation, ctrl.create);
router.put('/scholarships/:id',  auth, allowRoles('admin','superadmin','donor'), updateRules, handleValidation, ctrl.update);
router.delete('/scholarships/:id', auth, allowRoles('admin','superadmin','donor'), ctrl.archive);

// student apply
router.post('/scholarships/:id/apply', auth, allowRoles('student'), ctrl.apply);

module.exports = router;
