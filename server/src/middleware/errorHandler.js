function errorHandler(err, _req, res, _next) {
  const message = err.message || 'Server error';
  const status = message === 'Invalid credentials' || message.startsWith('Missing') ? 401
               : message === 'Email already in use' ? 409
               : 400;
  res.status(status).json({ error: message });
}
module.exports = errorHandler;
