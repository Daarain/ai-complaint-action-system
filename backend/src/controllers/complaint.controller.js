const Complaint = require('../models/Complaint');
const StatusUpdate = require('../models/StatusUpdate');
const Assignment = require('../models/Assignment');
const ComplaintMedia = require('../models/ComplaintMedia');
const { createComplaint, buildFilter } = require('../services/complaint.service');
const { success, AppError } = require('../utils/response');
const { isValidObjectId } = require('../utils/validators');

async function create(req, res, next) {
  try { return success(res, await createComplaint(req.user, req.body), 'Complaint created.', 201); } catch (error) { next(error); }
}

async function list(req, res, next) {
  try {
    const filter = buildFilter(req.query);
    if (req.user.role === 'citizen') filter.user_id = req.user._id;
    if (req.user.role === 'officer') filter.assigned_to = req.user._id;
    const complaints = await Complaint.find(filter).populate('issue_type_id', 'name').populate('location_id').populate('assigned_to', 'name email').sort({ created_at: -1 });
    return success(res, complaints);
  } catch (error) { next(error); }
}

async function details(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid complaint ID.', 400);
    const complaint = await Complaint.findById(req.params.id).populate('issue_type_id').populate('location_id').populate('assigned_to', 'name email role');
    if (!complaint) throw new AppError('Complaint not found.', 404);
    const userId = req.user._id.toString();
    if (req.user.role === 'citizen' && complaint.user_id.toString() !== userId) throw new AppError('You cannot view this complaint.', 403);
    if (req.user.role === 'officer' && (!complaint.assigned_to || complaint.assigned_to._id.toString() !== userId)) throw new AppError('You cannot view this complaint.', 403);
    const [timeline, assignment, media] = await Promise.all([
      StatusUpdate.find({ complaint_id: complaint._id }).populate('updated_by', 'name role').sort({ updated_at: 1 }),
      Assignment.findOne({ complaint_id: complaint._id }).sort({ assigned_at: -1 }).populate('department_id').populate('officer_id', 'name email'),
      ComplaintMedia.find({ complaint_id: complaint._id }).sort({ uploaded_at: 1 }),
    ]);
    return success(res, { complaint, assignment, timeline, media });
  } catch (error) { next(error); }
}

module.exports = { create, list, details };
