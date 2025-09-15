const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const router = express.Router();

// all admin-only
router.use(auth, allowRoles('admin', 'superadmin'));

// GET /api/admin/students?page=1&pageSize=10&search=ria&status=pending
router.get('/students', admin.listStudents);

// GET /api/admin/donors?page=1&pageSize=10&search=corp
router.get('/donors', admin.listDonors);

module.exports = router;
