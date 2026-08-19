const IssueType = require('../models/IssueType');
const { success, AppError } = require('../utils/response');
const { isValidObjectId } = require('../utils/validators');

async function list(req, res, next) { try { return success(res, await IssueType.find().sort({ name: 1 })); } catch (error) { next(error); } }
async function getOne(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid issue type ID.', 400);
    const issueType = await IssueType.findById(req.params.id);
    if (!issueType) throw new AppError('Issue type not found.', 404);
    return success(res, issueType);
  } catch (error) { next(error); }
}
async function create(req, res, next) {
  try {
    if (typeof req.body.name !== 'string' || !req.body.name.trim() || typeof req.body.category !== 'string' || !req.body.category.trim()) throw new AppError('Name and category are required.', 400);
    return success(res, await IssueType.create(req.body), 'Issue type created.', 201);
  } catch (error) { next(error); }
}
async function update(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid issue type ID.', 400);
    const issueType = await IssueType.findById(req.params.id);
    if (!issueType) throw new AppError('Issue type not found.', 404);
    ['name', 'category', 'description'].forEach((field) => { if (req.body[field] !== undefined) issueType[field] = req.body[field]; });
    await issueType.save();
    return success(res, issueType, 'Issue type updated.');
  } catch (error) { next(error); }
}
async function remove(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid issue type ID.', 400);
    const issueType = await IssueType.findByIdAndDelete(req.params.id);
    if (!issueType) throw new AppError('Issue type not found.', 404);
    return success(res, null, 'Issue type deleted.');
  } catch (error) { next(error); }
}
module.exports = { list, getOne, create, update, remove };
