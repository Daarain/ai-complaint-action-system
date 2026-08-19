const Complaint = require('../models/Complaint');
const { success, AppError } = require('../utils/response');
const { buildFilter } = require('../services/complaint.service');

function me(req, res) {
  const user = req.user;
  return success(res, { id: user._id, name: user.name, email: user.email, phone: user.phone, phoneVerified: user.phoneVerified, role: user.role, created_at: user.created_at, updated_at: user.updated_at });
}

async function updateMe(req, res, next) {
  try {
    const { name, phone } = req.body || {};
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) throw new AppError('Name must be a non-empty string.', 400);
    if (phone !== undefined && (typeof phone !== 'string' || phone.length > 30)) throw new AppError('Phone must be a valid string.', 400);
    if (name !== undefined) req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    await req.user.save();
    return me(req, res);
  } catch (error) { next(error); }
}

async function myComplaints(req, res, next) {
  try {
    const filter = { user_id: req.user._id, ...buildFilter(req.query) };
    const complaints = await Complaint.find(filter).populate('issue_type_id', 'name').sort({ created_at: -1 });
    return success(res, complaints.map((item) => ({
      id: item._id, title: item.title, issueType: item.issue_type_id?.name, priority: item.priority,
      status: item.status, created_at: item.created_at, updated_at: item.updated_at,
    })));
  } catch (error) { next(error); }
}

module.exports = { me, updateMe, myComplaints };
