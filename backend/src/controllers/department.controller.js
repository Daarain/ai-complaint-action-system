const Department = require('../models/Department');
const { success, AppError } = require('../utils/response');
const { isValidObjectId, slugify } = require('../utils/validators');

async function list(req, res, next) { try { return success(res, await Department.find().sort({ name: 1 })); } catch (error) { next(error); } }
async function getOne(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid department ID.', 400);
    const department = await Department.findById(req.params.id);
    if (!department) throw new AppError('Department not found.', 404);
    return success(res, department);
  } catch (error) { next(error); }
}
async function create(req, res, next) {
  try {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) throw new AppError('Department name is required.', 400);
    const department = await Department.create({ name: req.body.name, slug: req.body.slug ? slugify(req.body.slug) : slugify(req.body.name), contact_info: req.body.contact_info });
    return success(res, department, 'Department created.', 201);
  } catch (error) { next(error); }
}
async function update(req, res, next) {
  try {
    if (!isValidObjectId(req.params.id)) throw new AppError('Invalid department ID.', 400);
    const department = await Department.findById(req.params.id);
    if (!department) throw new AppError('Department not found.', 404);
    ['name', 'contact_info'].forEach((field) => { if (req.body[field] !== undefined) department[field] = req.body[field]; });
    if (req.body.slug !== undefined) department.slug = slugify(req.body.slug);
    await department.save();
    return success(res, department, 'Department updated.');
  } catch (error) { next(error); }
}
module.exports = { list, getOne, create, update };
