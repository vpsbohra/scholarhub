const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register({ email, name, password }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash });
  return { id: user.id, email: user.email, name: user.name };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'email', 'name'] });
  if (!user) throw new Error('User not found');
  return user;
}

module.exports = { register, login, getProfile };
