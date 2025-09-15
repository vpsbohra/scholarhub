
const authService = require('../services/authService');

exports.register = async (req,res,next)=>{ try {
  const { user_type } = req.body;
  if (user_type==='student') return res.status(201).json(await authService.registerStudent(req.body));
  if (user_type==='donor')   return res.status(201).json(await authService.registerDonor(req.body));
  if (user_type==='admin')   return res.status(201).json(await authService.registerAdmin(req.body));
  throw new Error('Invalid user type');
} catch(e){ next(e); } };

exports.login = async (req,res,next)=>{ try {
  res.json(await authService.login(req.body));
} catch(e){ next(e); } };

exports.me = async (req,res,next)=>{ try {
  res.json(await authService.me({ role: req.user.role, sub: req.user.sub }));
} catch(e){ next(e); } };

// add this handler to the file (or replace your existing one)
exports.google = async (req, res, next) => {
  try {
    const { credential, user_type } = req.body || {};
    if (!credential) throw new Error('Missing Google credential');
    if (!['student','donor'].includes(user_type)) throw new Error('Invalid user_type');

    const data = await authService.googleLoginRegister({ credential, user_type });
    return res.json(data);
  } catch (err) {
    console.error('[google]', err?.message || err);
    // return a clear 400 so Postman/console shows the real reason
    return res.status(400).json({ error: err?.message || 'Google auth failed' });
  }
};

