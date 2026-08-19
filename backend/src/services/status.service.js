const Complaint = require('../models/Complaint');
const StatusUpdate = require('../models/StatusUpdate');
const { AppError } = require('../utils/response');

const transitions = {
  submitted: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: [],
};

async function changeStatus({ complaint, status, remarks, user }) {
  if (user.role !== 'admin') {
    if (user.role !== 'officer' || !complaint.assigned_to || complaint.assigned_to.toString() !== user._id.toString()) {
      throw new AppError('Only the assigned officer or an admin can update this complaint.', 403);
    }
    if (!transitions[complaint.status]?.includes(status)) throw new AppError('Invalid complaint status transition.', 400);
  }
  complaint.status = status;
  await complaint.save();
  const update = await StatusUpdate.create({ complaint_id: complaint._id, status, remarks: typeof remarks === 'string' ? remarks : undefined, updated_by: user._id });
  return update;
}

module.exports = { changeStatus, transitions };
