const { fail } = require('../utils/response');

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID.';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists.';
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authentication token.';
  } else if (statusCode === 500) {
    message = 'Internal server error.';
  }
  return fail(res, message, statusCode);
}

module.exports = { notFound, errorHandler };
