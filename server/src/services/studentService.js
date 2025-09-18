const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const Student = require('../models/Student');

function paginate({ page = 1, pageSize = 10 }) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const ps = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  return { page: p, pageSize: ps, offset: (p - 1) * ps, limit: ps };
}

function buildWhere({ search, status }) {
  const where = {};
  if (search) {
    where[Op.or] = [
      { first_name:   { [Op.like]: `%${search}%` } },
      { last_name:    { [Op.like]: `%${search}%` } },
      { email:        { [Op.like]: `%${search}%` } },
      { phone_number: { [Op.like]: `%${search}%` } },
      { city:         { [Op.like]: `%${search}%` } },
      { state:        { [Op.like]: `%${search}%` } },
    ];
  }
  if (status) where.status = status;
  return where;
}

const ALLOWED_FIELDS = new Set([
  'first_name','last_name','email','phone_number','dob','gender',
  'guardian_name','annual_income','category',
  'address','city','state','pincode',
  'bank_account_no','ifsc_code',
  'documents_uploaded','email_verified','phone_verified','status'
]);

function pickAllowed(input) {
  return Object.fromEntries(Object.entries(input || {}).filter(([k]) => ALLOWED_FIELDS.has(k)));
}

async function list(params = {}) {
  const { offset, limit, page, pageSize } = paginate(params);
  const where = buildWhere(params);
  const { rows, count } = await Student.findAndCountAll({
    where,
    attributes: [
      'student_id','first_name','last_name','email','phone_number',
      'status','city','state','created_at'
    ],
    order: [['created_at', 'DESC']],
    offset, limit,
  });
  return { data: rows, total: count, page, pageSize };
}

async function get(id) {
  const s = await Student.findByPk(id);
  if (!s) {
    const err = new Error('Student not found');
    err.code = 404;
    throw err;
  }
  return s;
}

async function create(input) {
  const {
    first_name, last_name, email, password,
    phone_number, dob, gender, guardian_name, annual_income, category,
    address, city, state, pincode, bank_account_no, ifsc_code,
    status
  } = input;

  // Uniqueness precheck (still rely on DB unique constraint)
  const exists = await Student.findOne({ where: { email } });
  if (exists) {
    const err = new Error('Email already exists');
    err.code = 409;
    throw err;
  }

  const tempPassword = password || crypto.randomBytes(9).toString('base64url');
  const password_hash = await bcrypt.hash(tempPassword, 10);

  const student = await Student.create({
    first_name, last_name, email, phone_number, dob, gender,
    guardian_name, annual_income, category, address, city, state, pincode,
    bank_account_no, ifsc_code,
    password_hash,
    status: status || 'pending',
    documents_uploaded: false,
    email_verified: false,
    phone_verified: false,
  });

  return { student, generatedPassword: password ? null : tempPassword };
}

async function update(id, patch) {
  const s = await get(id);
  const data = pickAllowed(patch);
  await s.update(data);
  return s;
}

async function setStatus(id, status) {
  if (!['pending','verified','rejected','inactive'].includes(status)) {
    const err = new Error('Invalid status');
    err.code = 400;
    throw err;
  }
  const s = await get(id);
  await s.update({ status });
  return { ok: true, status };
}

async function listApplications(studentId, params = {}) {
  const { offset, limit, page, pageSize } = paginate(params);
  const [rows] = await Student.sequelize.query(
    `SELECT a.application_id, a.status, a.application_date,
            s.scholarship_id, s.scholarship_name, s.amount
     FROM applications a
     JOIN scholarships s ON s.scholarship_id = a.scholarship_id
     WHERE a.student_id = ?
     ORDER BY a.application_date DESC
     LIMIT ? OFFSET ?`,
    { replacements: [studentId, limit, offset] }
  );

  const [[{ cnt }]] = await Student.sequelize.query(
    `SELECT COUNT(*) AS cnt FROM applications WHERE student_id = ?`,
    { replacements: [studentId] }
  );

  return { data: rows, page, pageSize, total: cnt };
}

module.exports = {
  list,
  get,
  create,
  update,
  setStatus,
  listApplications,
};
