const multer = require('multer');

module.exports = (err, req, res, next) => {
  if (res.headersSent) return;

  if (err instanceof multer.MulterError || err.message === 'Unsupported file type') {
    return res.status(422).json({ errors: [{ field: 'file', message: err.message }] });
  }

  // Foreign key constraint (e.g., student_id doesn't exist)
  if (err.name === 'SequelizeForeignKeyConstraintError' || err.parent?.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(404).json({ error: 'Student not found' });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ errors: [{ field: err.errors?.[0]?.path || 'field', message: 'Already in use' }] });
  }

  const status = err.code && Number.isInteger(err.code) ? err.code : 400;
  return res.status(status).json({ error: err.message || 'Request failed' });
};
