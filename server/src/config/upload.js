const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const uploadsBase = path.join(__dirname, '../../uploads'); // ← base folder

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const studentId = req.params.studentId || req.user?.sub;
    const dir = path.join(uploadsBase, 'students', String(studentId)); // uploads/students/:id
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const allowed = new Set(['application/pdf','image/png','image/jpeg','image/jpg','image/webp']);
function fileFilter(req, file, cb) { allowed.has(file.mimetype) ? cb(null, true) : cb(new Error('Unsupported file type'), false); }

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { upload, uploadsBase }; // ← export uploadsBase
