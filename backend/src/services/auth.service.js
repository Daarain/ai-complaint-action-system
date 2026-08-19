const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const env = require('../config/env');
const { AppError } = require('../utils/response');

function safeUser(user) {
  return {
    id: user._id, name: user.name, email: user.email, phone: user.phone,
    phoneVerified: user.phoneVerified, role: user.role,
  };
}

function generateToken(user) {
  if (!env.jwtSecret) throw new AppError('JWT authentication is not configured.', 503);
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: '7d' });
}

async function signup({ name, email, password, phone }) {
  if (!env.jwtSecret) throw new AppError('JWT authentication is not configured.', 503);
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AppError('An account with this email already exists.', 409);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(), email: normalizedEmail, password: passwordHash, phone: phone.trim(),
    phoneVerified: false, role: 'citizen',
  });
  return { token: generateToken(user), user: safeUser(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError('Invalid email or password.', 401);
  return { token: generateToken(user), user: safeUser(user) };
}

module.exports = { signup, login };
