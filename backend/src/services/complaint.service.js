const Complaint = require('../models/Complaint');
const Location = require('../models/Location');
const ComplaintMedia = require('../models/ComplaintMedia');
const StatusUpdate = require('../models/StatusUpdate');
const IssueType = require('../models/IssueType');
const { analyzeComplaint } = require('./ai.service');
const { calculatePriority } = require('./priority.service');
const { routeDepartment } = require('./routing.service');
const { AppError } = require('../utils/response');

async function createComplaint(user, payload) {
  const issueType = await IssueType.findById(payload.issue_type_id);
  if (!issueType) throw new AppError('Issue type not found.', 404);
  const raw = payload.location;
  const locationData = {
    lat: Number(raw.latitude ?? raw.lat), lng: Number(raw.longitude ?? raw.lng),
    address: raw.address?.trim() || '', area: raw.area?.trim() || '', ward: raw.ward?.trim() || '',
  };
  let location = await Location.findOne(locationData);
  if (!location) location = await Location.create(locationData);

  const ai = await analyzeComplaint(payload.description);
  const priority = calculatePriority({ issueType: issueType.name, description: payload.description, area: location.area, aiPriority: ai.priority });
  const complaint = await Complaint.create({
    user_id: user._id, title: payload.title, description: payload.description,
    issue_type_id: issueType._id, location_id: location._id, priority, status: 'submitted',
  });
  await StatusUpdate.create({ complaint_id: complaint._id, status: 'submitted', remarks: 'Complaint submitted.', updated_by: user._id });

  if (Array.isArray(payload.media)) {
    const safeMedia = payload.media.filter((item) => item && typeof item.file_url === 'string' && ['image', 'video', 'audio'].includes(item.media_type));
    if (safeMedia.length) await ComplaintMedia.insertMany(safeMedia.map((item) => ({ ...item, complaint_id: complaint._id })));
  }

  const department = await routeDepartment(issueType.name);
  return { complaint, analysis: ai, suggestedDepartment: department ? { id: department._id, name: department.name } : null };
}

function buildFilter(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.issue_type) filter.issue_type_id = query.issue_type;
  return filter;
}

module.exports = { createComplaint, buildFilter };
