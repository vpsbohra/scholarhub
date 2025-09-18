const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const router = express.Router();
const { createStudentValidator, validate } = require('../validators/adminStudentValidators');

// all admin-only
router.use(auth, allowRoles('admin', 'superadmin'));

// GET /api/admin/students?page=1&pageSize=10&search=ria&status=pending
router.get('/students', admin.listStudents);

// GET /api/admin/donors?page=1&pageSize=10&search=corp
router.get('/donors', admin.listDonors);

// NEW:
router.get('/students/:id', admin.getStudentById);
router.put('/students/:id', admin.updateStudent);
router.patch('/students/:id/status', admin.setStudentStatus);
router.get('/students/:id/applications', admin.listStudentApplications);
router.post('/students', createStudentValidator, validate, admin.createStudent);


module.exports = router;
