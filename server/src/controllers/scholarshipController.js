const { Op } = require('sequelize');
const Scholarship = require('../models/Scholarship');

// Optional activity logger (works even without a model; no-op if table missing)
async function logActivity(req, action) {
  try {
    const user_type =
      req.user.role === 'student' ? 'student' :
      req.user.role === 'donor'   ? 'donor'   : 'admin';
    const user_id = req.user.sub;
    await Scholarship.sequelize.query(
      'INSERT INTO activity_logs (user_type, user_id, action) VALUES (?, ?, ?)',
      { replacements: [user_type, user_id, action] }
    );
  } catch (_) { /* ignore if table/model not present */ }
}

function paginate(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 100);
  return { limit: pageSize, offset: (page - 1) * pageSize, page, pageSize };
}

exports.list = async (req, res, next) => {
  try {
    const { search = '', status, owner } = req.query;
    const { limit, offset, page, pageSize } = paginate(req);

    const where = {};
    if (search) {
      where[Op.or] = [
        { scholarship_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { eligibility_criteria: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (owner === 'me' && req.user?.role === 'donor') where.donor_id = req.user.sub;

    const { rows, count } = await Scholarship.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit, offset,
    });

    res.json({ data: rows, total: count, page, pageSize });
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const s = await Scholarship.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json(s);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user.role === 'donor') payload.donor_id = req.user.sub;

    if (payload.start_date && payload.end_date && payload.end_date < payload.start_date) {
      throw new Error('end_date must be after start_date');
    }

    const s = await Scholarship.create(payload);
    await logActivity(req, `created scholarship ${s.scholarship_id}`);
    res.status(201).json(s);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const s = await Scholarship.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });

    if (req.user.role === 'donor' && s.donor_id !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'donor') delete req.body.donor_id;

    if (req.body.start_date && req.body.end_date && req.body.end_date < req.body.start_date) {
      throw new Error('end_date must be after start_date');
    }

    await s.update(req.body);
    await logActivity(req, `updated scholarship ${s.scholarship_id}`);
    res.json(s);
  } catch (e) { next(e); }
};

exports.archive = async (req, res, next) => {
  try {
    const s = await Scholarship.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'donor' && s.donor_id !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await s.update({ status: 'archived' });
    await logActivity(req, `archived scholarship ${s.scholarship_id}`);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

exports.apply = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can apply' });

    const s = await Scholarship.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });

    const today = new Date().toISOString().slice(0, 10);
    if (s.status !== 'active' || today < s.start_date || today > s.end_date) {
      return res.status(400).json({ error: 'Applications are closed' });
    }

    // Duplicate check + insert via raw SQL (no Application model required)
    const [rows] = await Scholarship.sequelize.query(
      'SELECT application_id FROM applications WHERE student_id = ? AND scholarship_id = ? LIMIT 1',
      { replacements: [req.user.sub, s.scholarship_id] }
    );
    if (rows.length) return res.status(409).json({ error: 'Already applied' });

    await Scholarship.sequelize.query(
      "INSERT INTO applications (student_id, scholarship_id, status) VALUES (?, ?, 'pending')",
      { replacements: [req.user.sub, s.scholarship_id] }
    );

    await logActivity(req, `applied to scholarship ${s.scholarship_id}`);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
};
