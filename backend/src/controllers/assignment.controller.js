const Assignment = require('../models/Assignment');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');
const StatusUpdate = require('../models/StatusUpdate');
const { success, AppError } = require('../utils/response');
const { isValidObjectId } = require('../utils/validators');

async function list(req, res, next) {
  try { return success(res, await Assignment.find().populate('complaint_id', 'title status').populate('department_id').populate('officer_id', 'name email').sort({ assigned_at: -1 })); } catch (error) { next(error); }
}
async function getOne(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid assignment ID.', 400);
    const assignment = await Assignment.findById(req.params.id).populate('complaint_id').populate('department_id').populate('officer_id', 'name email role');
    if (!assignment) throw new AppError('Assignment not found.', 404);
    return success(res, assignment);
  } catch (error) { next(error); }
}
async function create(req, res, next) {
  try {
    const { complaint_id, department_id, officer_id, due_date } = req.body || {};
    if (![complaint_id, department_id, officer_id].every(isValidObjectId)) throw new AppError('Valid complaint_id, department_id, and officer_id are required.', 400);
    if (due_date && Number.isNaN(new Date(due_date).getTime())) throw new AppError('Invalid due_date.', 400);
    const [complaint, department, officer] = await Promise.all([Complaint.findById(complaint_id), Department.findById(department_id), User.findById(officer_id)]);
    if (!complaint || !department || !officer) throw new AppError('Complaint, department, or officer not found.', 404);
    if (officer.role !== 'officer') throw new AppError('Assigned user must have the officer role.', 400);
    const assignment = await Assignment.create({ complaint_id, department_id, officer_id, due_date });
    complaint.assigned_to = officer_id;
    complaint.status = 'assigned';
    await complaint.save();
    await StatusUpdate.create({ complaint_id, status: 'assigned', remarks: 'Complaint assigned to officer.', updated_by: req.user._id });
    return success(res, assignment, 'Complaint assigned.', 201);
  } catch (error) { next(error); }
}
module.exports = { list, getOne, create };
