const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Student = require('../models/Student');
const CsrDonor = require('../models/CsrDonor');
const User = require('../models/User'); // <- admin table

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}
// in services/authService.js, right before verifyIdToken
console.log('[srv] GOOGLE_CLIENT_ID:', (process.env.GOOGLE_CLIENT_ID || '').slice(0, 12));

async function verifyGoogleIdToken(credential) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('[srv] verified email:', payload?.email, 'sub:', payload?.sub?.slice(0,8));
    return payload;
  } catch (e) {
    console.error('[srv] verifyIdToken error:', e.message);
    throw e;
  }
}

async function googleLoginRegister({ credential, user_type }) {
  if (!['student','donor'].includes(user_type)) {
    throw new Error('Invalid user type');
  }

  const payload = await verifyGoogleIdToken(credential);
  if (!payload?.email || payload.email_verified === false) {
    throw new Error('Google account email not verified');
  }

  const email = payload.email;
  const googleSub = payload.sub;
  const givenName = payload.given_name || '';
  const familyName = payload.family_name || '';

  if (user_type === 'student') {
    let user = await Student.findOne({ where: { email } });

    if (!user) {
      // create new student with a random password to satisfy NOT NULL
      const random = await bcrypt.hash(`${googleSub}.${Date.now()}`, 10);
      user = await Student.create({
        email,
        first_name: givenName,
        last_name: familyName,
        password_hash: random,
        provider: 'google',
        provider_id: googleSub,
        status: 'verified', // optional: trust Google and mark verified, or keep 'pending'
      });
    } else if (user.provider !== 'google' && !user.provider) {
      // existing local user logging in via Google -> link provider
      await user.update({ provider: 'google', provider_id: googleSub });
    }

    const token = signToken({ sub: user.student_id, role: 'student', idField: 'student_id' });
    return { token, role: 'student', user: { id: user.student_id, email: user.email } };
  }

  // donor
  let donor = await CsrDonor.findOne({ where: { email } });

  if (!donor) {
    const random = await bcrypt.hash(`${googleSub}.${Date.now()}`, 10);
    donor = await CsrDonor.create({
      email,
      organization_name: '',       
      contact_person: payload.name || '',
      password_hash: random,
      provider: 'google',
      provider_id: googleSub,
    });
  } else if (donor.provider !== 'google' && !donor.provider) {
    await donor.update({ provider: 'google', provider_id: googleSub });
  }

  const token = signToken({ sub: donor.donor_id, role: 'donor', idField: 'donor_id' });
  return { token, role: 'donor', user: { id: donor.donor_id, email: donor.email } };
}


async function registerStudent(body) {
  const { email, password, first_name, last_name, ...rest } = body;
  const exists = await Student.findOne({ where: { email } });
  if (exists) throw new Error('Email already in use');
  const password_hash = await bcrypt.hash(password, 10);
  const stu = await Student.create({ email, first_name, last_name, password_hash, ...rest });
  return { student_id: stu.student_id, email: stu.email };
}

async function registerDonor(body) {
  const { email, password, organization_name, contact_person, ...rest } = body;
  const exists = await CsrDonor.findOne({ where: { email } });
  if (exists) throw new Error('Email already in use');
  const password_hash = await bcrypt.hash(password, 10);
  const d = await CsrDonor.create({ email, organization_name, contact_person, password_hash, ...rest });
  return { donor_id: d.donor_id, email: d.email };
}

// Admin registration typically protected; keep it here for completeness.
async function registerAdmin(body) {
  const { email, password, name, role = 'admin' } = body;
  const exists = await User.findOne({ where: { email } });
  if (exists) throw new Error('Email already in use');
  const password_hash = await bcrypt.hash(password, 10);
  const a = await User.create({ email, name, passwordHash: password_hash, role });
  return { id: a.id, email: a.email, role: a.role };
}

async function login({ user_type, email, password }) {
  let user, idField, role;

  if (user_type === 'student') {
    user = await Student.findOne({ where: { email } });
    idField = 'student_id'; role = 'student';
  } else if (user_type === 'donor') {
    user = await CsrDonor.findOne({ where: { email } });
    idField = 'donor_id'; role = 'donor';
  } else if (user_type === 'admin') {
    user = await User.findOne({ where: { email } });
    idField = 'id'; role = user?.role || 'admin';
  } else {
    throw new Error('Invalid user type');
  }

  if (!user) throw new Error('Invalid credentials');
  const hash = user.password_hash || user.passwordHash; // support both mappings
  const ok = await bcrypt.compare(password, hash || '');
  if (!ok) throw new Error('Invalid credentials');

  const token = signToken({ sub: user[idField], role, idField });
  return { token, role, user: { id: user[idField], email: user.email, name: user.name || user.organization_name } };
}

async function me({ role, sub }) {
  if (role === 'student')   return Student.findByPk(sub, { attributes: ['student_id','email','first_name','last_name','status'] });
  if (role === 'donor')     return CsrDonor.findByPk(sub, { attributes: ['donor_id','email','organization_name','contact_person','total_contribution'] });
  if (role === 'admin' || role === 'superadmin')
    return User.findByPk(sub, { attributes: ['id','email','name','role'] });
  throw new Error('Invalid role');
}

module.exports = { registerStudent, registerDonor, registerAdmin, login, me,googleLoginRegister };
