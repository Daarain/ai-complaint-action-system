function success(res, data, message, statusCode = 200) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  return res.status(statusCode).json(payload);
}

function fail(res, message, statusCode = 500) {
  return res.status(statusCode).json({ success: false, message });
}

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { success, fail, AppError };
