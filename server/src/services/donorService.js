const { Op } = require('sequelize');
const CsrDonor = require('../models/CsrDonor');
const Scholarship = require('../models/Scholarship'); // used to check FK before delete

function paginate({ page = 1, pageSize = 10 }) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const ps = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  return { page: p, pageSize: ps, offset: (p - 1) * ps, limit: ps };
}

function buildWhere({ search, status }) {
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
  if (status) where.status = status; // 'active' | 'inactive'
  return where;
}

const ALLOWED_FIELDS = new Set([
  'organization_name','contact_person','email','phone_number','pan_number',
  'address','city','state','pincode','total_contribution'
]);

function pickAllowed(input) {
  return Object.fromEntries(Object.entries(input || {}).filter(([k]) => ALLOWED_FIELDS.has(k)));
}

async function list(params = {}) {
  const { offset, limit, page, pageSize } = paginate(params);
  const where = buildWhere(params);
  const { rows, count } = await CsrDonor.findAndCountAll({
    where,
    attributes: [
      'donor_id','organization_name','contact_person','email','phone_number',
      'city','state','total_contribution','status','created_at'
    ],
    order: [['created_at','DESC']],
    offset, limit,
  });
  return { data: rows, total: count, page, pageSize };
}

async function get(id) {
  const d = await CsrDonor.findByPk(id);
  if (!d) { const e = new Error('Donor not found'); e.code = 404; throw e; }
  return d;
}

async function create(input) {
  const donor = await CsrDonor.create({
    organization_name: input.organization_name,
    contact_person: input.contact_person,
    email: input.email,
    phone_number: input.phone_number,
    pan_number: input.pan_number,
    address: input.address,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    total_contribution: input.total_contribution ?? 0,
    password_hash: input.password_hash, // if using local login
    status: 'inactive',
  });
  return { donor, generatedPassword: null }; // unchanged from your earlier logic if you generate passwords
}

async function update(id, patch) {
  const d = await get(id);
  await d.update(pickAllowed(patch));
  return d;
}

async function setStatus(id, status) {
  if (!['active','inactive'].includes(status)) {
    const e = new Error('Invalid status'); e.code = 422; throw e;
  }
  const d = await get(id);
  await d.update({ status });
  return { ok: true, status };
}

async function remove(id) {
  const d = await get(id);
  // prevent delete if scholarships reference this donor
  const count = await Scholarship.count({ where: { donor_id: id } });
  if (count > 0) {
    const e = new Error('Cannot delete donor with existing scholarships'); e.code = 409; throw e;
  }
  await d.destroy();
  return { ok: true };
}

module.exports = { list, get, create, update, setStatus, remove };
