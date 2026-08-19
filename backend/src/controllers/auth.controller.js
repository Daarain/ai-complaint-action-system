const authService = require('../services/auth.service');
const { success } = require('../utils/response');

async function signup(req, res, next) {
  try {
    return success(res, await authService.signup(req.body), 'Signup successful.', 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    return success(res, await authService.login(req.body), 'Login successful.');
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
