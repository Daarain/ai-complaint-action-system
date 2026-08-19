const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { AppError } = require('../utils/response');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication is required.', 401);
    if (!env.jwtSecret) throw new AppError('JWT authentication is not configured.', 503);
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id).select('-__v');
    if (!user) throw new AppError('User account no longer exists.', 401);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { protect };
