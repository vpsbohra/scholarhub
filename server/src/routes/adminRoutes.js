const express = require('express');
const { auth, allowRoles } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const router = express.Router();
const { createStudentValidator, validate } = require('../validators/adminStudentValidators');
const { createDonorValidator, updateDonorValidator } = require('../validators/adminDonorValidators');
const { studentIdParam, idParam, uploadRules } = require('../validators/studentDocumentValidators');
const docSvc = require('../services/studentDocumentService');
const { upload } = require('../config/upload');

// all admin-only
router.use(auth, allowRoles('admin', 'superadmin'));

// Students
router.get('/students', admin.listStudents);
router.get('/students/:id', admin.getStudentById);
router.put('/students/:id', admin.updateStudent);
router.patch('/students/:id/status', admin.setStudentStatus);
router.get('/students/:id/applications', admin.listStudentApplications);
router.post('/students', createStudentValidator, validate, admin.createStudent);
// Donors
router.get('/donors', admin.listDonors);
router.get('/donors/:id', admin.getDonorById);
router.post('/donors', createDonorValidator, validate, admin.createDonor);
router.put('/donors/:id', updateDonorValidator, validate, admin.updateDonor);
router.patch('/donors/:id/status', async (req, res, next) => admin.setDonorStatus(req, res, next));
router.delete('/donors/:id', async (req, res, next) => admin.removeDonor(req, res, next));


// LIST student's docs
router.get('/students/:studentId/documents', studentIdParam, validate, async (req, res, next) => {
  try { res.json(await docSvc.adminList(req.params.studentId)); }
  catch (e) { next(e); }
});

// ADMIN: upload a document for a student
router.post(
  '/students/:studentId/documents',
  studentIdParam,
  upload.single('file'),
  uploadRules,
  validate,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(422).json({ errors: [{ field: 'file', message: 'File is required' }] });
      }
      const doc = await docSvc.createOrReplace(req.params.studentId, req.body, req.file);
      return res.status(201).json(doc);
    } catch (e) {
      // 🔎 one-time deep log so we can see the actual reason
      console.error('[adminUploadDoc] ERROR ->', {
        name: e.name,
        message: e.message,
        code: e.code,
        sqlCode: e.parent?.code,
        sqlState: e.parent?.sqlState,
        sqlMessage: e.parent?.sqlMessage,
        stack: e.stack,
      });

      // Map common DB errors to clear responses
      if (e.name === 'SequelizeForeignKeyConstraintError' || e.parent?.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ error: 'Student not found' });
      }
      if (e.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ error: e.parent?.sqlMessage || 'Database error' });
      }
      if (e.code) return res.status(e.code).json({ error: e.message });

      // Let your global handler run for anything else
      return next(e);
    }
  }
);

// ADMIN: delete a student's document
router.delete(
  '/students/:studentId/documents/:id',
  studentIdParam.concat(idParam), validate,
  async (req, res, next) => {
    try {
      const result = await docSvc.remove(req.params.studentId, req.params.id);
      res.json(result);
    } catch (e) {
      return e.code ? res.status(e.code).json({ error: e.message }) : next(e);
    }
  }
);


module.exports = router;
