const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const Student = require('../models/Student');
const CsrDonor = require('../models/CsrDonor');
const studentService = require('../services/studentService');
const donorService = require('../services/donorService');


function getPagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize || '10', 10), 1), 100);
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  return { page, pageSize, offset, limit };
}

// LIST
exports.listStudents = async (req, res, next) => {
  try {
    const result = await studentService.list(req.query);
    res.json(result);
  } catch (e) { next(e); }
};

exports.listDonors = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const { offset, limit, page, pageSize } = getPagination(req.query);

    const where = {};
    if (search) {
      where[Op.or] = [
        { organization_name: { [Op.like]: `%${search}%` } },
        { contact_person:    { [Op.like]: `%${search}%` } },
        { email:             { [Op.like]: `%${search}%` } },
        { phone_number:      { [Op.like]: `%${search}%` } },
        { city:              { [Op.like]: `%${search}%` } },
        { state:             { [Op.like]: `%${search}%` } },
        { pan_number:        { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await CsrDonor.findAndCountAll({
      where,
      attributes: [
        'donor_id','organization_name','contact_person','email',
        'phone_number','city','state','total_contribution','created_at'
      ],
      order: [['created_at', 'DESC']],
      offset, limit,
    });

    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) { next(e); }
};


// GET
exports.getStudentById = async (req, res, next) => {
  try {
    const s = await studentService.get(req.params.id);
    res.json(s);
  } catch (e) {
    if (e.code === 404) return res.status(404).json({ error: e.message });
    next(e);
  }
};

// CREATE
exports.createStudent = async (req, res, next) => {
  try {
    const { student, generatedPassword } = await studentService.create(req.body);
    res.status(201).json({
      student_id: student.student_id,
      email: student.email,
      status: student.status,
      generated_password: generatedPassword,
    });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError' || e.code === 409) {
      return res.status(409).json({ error: 'Email or phone already in use' });
    }
    return e.code ? res.status(e.code).json({ error: e.message }) : next(e);
  }
};

// UPDATE
exports.updateStudent = async (req, res, next) => {
  try {
    const s = await studentService.update(req.params.id, req.body);
    res.json(s);
  } catch (e) {
    if (e.code === 404) return res.status(404).json({ error: e.message });
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email or phone already in use' });
    }
    next(e);
  }
};

// SET STATUS
exports.setStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const data = await studentService.setStatus(req.params.id, status);
    res.json(data);
  } catch (e) {
    if (e.code) return res.status(e.code).json({ error: e.message });
    next(e);
  }
};

// LIST APPLICATIONS
exports.listStudentApplications = async (req, res, next) => {
  try {
    const data = await studentService.listApplications(req.params.id, req.query);
    res.json(data);
  } catch (e) { next(e); }
};


// LIST (refactor your existing one to use service)
exports.listDonors = async (req, res, next) => {
  try { res.json(await donorService.list(req.query)); }
  catch (e) { next(e); }
};

// GET
exports.getDonorById = async (req, res, next) => {
  try { res.json(await donorService.get(req.params.id)); }
  catch (e) { return e.code ? res.status(e.code).json({ error: e.message }) : next(e); }
};

// CREATE
exports.createDonor = async (req, res, next) => {
  try {
    const { donor, generatedPassword } = await donorService.create(req.body);
    res.status(201).json({
      donor_id: donor.donor_id,
      email: donor.email,
      organization_name: donor.organization_name,
      generated_password: generatedPassword,
    });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError' || e.code === 409) {
      // Map known unique fields (email, pan_number)
      return res.status(409).json({ errors: [{ field: 'email', message: 'Already in use' }] });
    }
    return e.code ? res.status(e.code).json({ error: e.message }) : next(e);
  }
};

// UPDATE
exports.updateDonor = async (req, res, next) => {
  try { res.json(await donorService.update(req.params.id, req.body)); }
  catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ errors: [{ field: 'email', message: 'Already in use' }] });
    }
    return e.code ? res.status(e.code).json({ error: e.message }) : next(e);
  }
};


exports.setDonorStatus = async (req, res, next) => {
  try { res.json(await donorService.setStatus(req.params.id, req.body.status)); }
  catch (e) { return e.code ? res.status(e.code).json({ error: e.message }) : next(e); }
};

exports.removeDonor = async (req, res, next) => {
  try { res.json(await donorService.remove(req.params.id)); }
  catch (e) { return e.code ? res.status(e.code).json({ error: e.message }) : next(e); }
};
