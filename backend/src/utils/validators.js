const mongoose = require('mongoose');

const STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function isFiniteNumber(value) {
  return value !== '' && Number.isFinite(Number(value));
}

function slugify(value) {
  return String(value || '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

module.exports = { STATUSES, PRIORITIES, isValidObjectId, isFiniteNumber, slugify };
