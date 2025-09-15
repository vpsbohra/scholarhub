const { Op } = require('sequelize');
const Student = require('../models/Student');
const CsrDonor = require('../models/CsrDonor');

function getPagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize || '10', 10), 1), 100);
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  return { page, pageSize, offset, limit };
}

exports.listStudents = async (req, res, next) => {
  try {
    const { search = '', status } = req.query;
    const { offset, limit, page, pageSize } = getPagination(req.query);

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name:  { [Op.like]: `%${search}%` } },
        { email:      { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
        { city:       { [Op.like]: `%${search}%` } },
        { state:      { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    const { rows, count } = await Student.findAndCountAll({
      where,
      attributes: [
        'student_id','first_name','last_name','email','phone_number',
        'status','city','state','created_at'
      ],
      order: [['created_at', 'DESC']],
      offset, limit,
    });

    res.json({ data: rows, page, pageSize, total: count });
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
