const { AppError } = require('../utils/response');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(req, res, next) {
  const { name, email, password, phone } = req.body || {};
  if (typeof name !== 'string' || !name.trim()) return next(new AppError('Name is required.', 400));
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) return next(new AppError('A valid email is required.', 400));
  if (typeof password !== 'string' || password.length < 8) return next(new AppError('Password must be at least 8 characters long.', 400));
  if (typeof phone !== 'string' || !phone.trim()) return next(new AppError('Phone is required.', 400));
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !emailPattern.test(email.trim()) || typeof password !== 'string' || !password) {
    return next(new AppError('Email and password are required.', 400));
  }
  next();
}

module.exports = { validateSignup, validateLogin };
