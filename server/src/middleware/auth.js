const jwt = require('jsonwebtoken');

const auth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new Error('Missing token'));
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { next(new Error('Invalid token')); }
};

const allowRoles = (...roles) =>
  (req, _res, next) => (!req.user || !roles.includes(req.user.role))
    ? next(new Error('Forbidden'))
    : next();

module.exports = { auth, allowRoles }; // <-- must export functions
