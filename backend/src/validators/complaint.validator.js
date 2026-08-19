const { AppError } = require('../utils/response');
const { isValidObjectId, isFiniteNumber, STATUSES, PRIORITIES } = require('../utils/validators');

function validateComplaint(req, res, next) {
  const { title, description, issue_type_id, location } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
    return next(new AppError('Title and description are required.', 400));
  }
  if (!isValidObjectId(issue_type_id)) return next(new AppError('A valid issue_type_id is required.', 400));
  if (!location || !isFiniteNumber(location.latitude ?? location.lat) || !isFiniteNumber(location.longitude ?? location.lng)) {
    return next(new AppError('Valid location latitude and longitude are required.', 400));
  }
  next();
}

function validateStatus(req, res, next) {
  if (!STATUSES.includes(req.body?.status)) return next(new AppError('Invalid complaint status.', 400));
  next();
}

function validateFilters(req, res, next) {
  if (req.query.status && !STATUSES.includes(req.query.status)) return next(new AppError('Invalid status filter.', 400));
  if (req.query.priority && !PRIORITIES.includes(req.query.priority)) return next(new AppError('Invalid priority filter.', 400));
  if (req.query.issue_type && !isValidObjectId(req.query.issue_type)) return next(new AppError('Invalid issue type filter.', 400));
  next();
}

module.exports = { validateComplaint, validateStatus, validateFilters };
