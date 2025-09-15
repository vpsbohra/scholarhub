const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const student = require('../controllers/studentProfileController');
const donor   = require('../controllers/donorProfileController');
const { studentUpdateValidator, donorUpdateValidator, handleValidation } = require('../validators/profileValidators');

const router = express.Router();

// STUDENT
router.get('/students/me',  auth, allowRoles('student'), student.getMe);
router.put('/students/me',  auth, allowRoles('student'), studentUpdateValidator, handleValidation, student.updateMe);

// DONOR
router.get('/donors/me',    auth, allowRoles('donor'),   donor.getMe);
router.put('/donors/me',    auth, allowRoles('donor'),   donorUpdateValidator, handleValidation, donor.updateMe);

module.exports = router;
