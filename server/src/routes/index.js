const express = require('express');
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const adminRoutes = require('./adminRoutes');
const scholarshipRoutes = require('./scholarshipRoutes');

const router = express.Router();
router.use('/api', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api', scholarshipRoutes);

module.exports = router;
