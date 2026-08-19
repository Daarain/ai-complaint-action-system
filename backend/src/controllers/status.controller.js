const Complaint = require('../models/Complaint');
const StatusUpdate = require('../models/StatusUpdate');
const { changeStatus } = require('../services/status.service');
const { success, AppError } = require('../utils/response');
const { isValidObjectId } = require('../utils/validators');

async function updateComplaintStatus(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid complaint ID.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError('Complaint not found.', 404);
    const update = await changeStatus({ complaint, status: req.body.status, remarks: req.body.remarks, user: req.user });
    return success(res, { complaint, statusUpdate: update }, 'Complaint status updated.');
  } catch (error) { next(error); }
}

async function timeline(req, res, next) {
  try {
    if (!isValidObjectId(req.params.complaintId)) throw new AppError('Invalid complaint ID.', 400);
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) throw new AppError('Complaint not found.', 404);
    const own = complaint.user_id.toString() === req.user._id.toString();
    const assigned = complaint.assigned_to?.toString() === req.user._id.toString();
    if (req.user.role === 'citizen' && !own) throw new AppError('You cannot view this timeline.', 403);
    if (req.user.role === 'officer' && !assigned) throw new AppError('You cannot view this timeline.', 403);
    return success(res, await StatusUpdate.find({ complaint_id: complaint._id }).populate('updated_by', 'name role').sort({ updated_at: 1 }));
  } catch (error) { next(error); }
}

module.exports = { updateComplaintStatus, timeline };
