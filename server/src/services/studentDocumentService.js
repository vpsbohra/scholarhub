const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const StudentDocument = require('../models/StudentDocument');
const { uploadsBase } = require('../config/upload');

function sha256File(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch { return null; }
}

async function listForStudent(studentId) {
  return StudentDocument.findAll({
    where: { student_id: studentId },
    order: [['uploaded_at','DESC']]
  });
}


function toPublicPath(absPath) {
  // abs -> '.../uploads/students/123/file.jpg'  =>  '/uploads/students/123/file.jpg'
  const rel = path.relative(uploadsBase, absPath).split(path.sep).join('/'); // fix Windows backslashes
  return `/uploads/${rel}`;
}

/** Ensure one doc for id/address; allow many for education */
async function createOrReplace(studentId, payload, file) {
  if (!file) {
    const e = new Error('File is required'); e.code = 422; throw e;
  }

  const doc = {
    student_id: studentId,
    doc_type: payload.doc_type,
    title: payload.title || null,
    file_name: file.originalname,
    file_path: toPublicPath(file.path), // store relative-ish
    mime_type: file.mimetype,
    file_size: file.size,
    status: 'pending',
    remarks: null,
    checksum: sha256File(file.path),
  };

  if (!['id_proof','address_proof','education'].includes(doc.doc_type)) {
    const e = new Error('Invalid doc_type'); e.code = 422; throw e;
  }

  // if (doc.doc_type === 'education') {
    // return StudentDocument.create(doc);
  // }

  // For id/address: replace existing if any
  // const existing = await StudentDocument.findOne({ where: { student_id: studentId, doc_type: doc.doc_type } });
  // if (existing) {
  //   // remove old file (best effort)
  //   try { if (existing.file_path && fs.existsSync(existing.file_path)) fs.unlinkSync(existing.file_path); } catch {}
  //   await existing.update(doc);
  //   return existing;
  // }
  return StudentDocument.create(doc);
}

async function remove(studentId, documentId) {
  const doc = await StudentDocument.findByPk(documentId);
  if (!doc || doc.student_id !== Number(studentId)) {
    const e = new Error('Document not found'); e.code = 404; throw e;
  }
  try { if (doc.file_path && fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path); } catch {}
  await doc.destroy();
  return { ok: true };
}

// Admin actions
async function adminList(studentId) {
  return listForStudent(studentId);
}

async function setStatus(documentId, { status, remarks, adminUserId }) {
  if (!['pending','approved','rejected'].includes(status)) {
    const e = new Error('Invalid status'); e.code = 422; throw e;
  }
  const doc = await StudentDocument.findByPk(documentId);
  if (!doc) { const e = new Error('Document not found'); e.code = 404; throw e; }
  await doc.update({
    status, remarks: remarks || null,
    verified_at: status === 'approved' ? new Date() : null,
    verified_by: adminUserId || null,
  });
  return doc;
}

module.exports = {
  listForStudent,
  createOrReplace,
  remove,
  adminList,
  setStatus,
};
