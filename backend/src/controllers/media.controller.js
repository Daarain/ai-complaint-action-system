const Complaint = require('../models/Complaint');
const ComplaintMedia = require('../models/ComplaintMedia');
const { success, AppError } = require('../utils/response');
const { isValidObjectId } = require('../utils/validators');

function mediaType(mime) {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return null;
}
async function uploadMedia(req, res, next) {
  try {
    if (!isValidObjectId(req.params.complaintId)) throw new AppError('Invalid complaint ID.', 400);
    if (!req.file) throw new AppError('A media file is required.', 400);
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) throw new AppError('Complaint not found.', 404);
    const own = complaint.user_id.toString() === req.user._id.toString();
    const assigned = complaint.assigned_to?.toString() === req.user._id.toString();
    if (req.user.role === 'citizen' && !own) throw new AppError('You cannot attach media to this complaint.', 403);
    if (req.user.role === 'officer' && !assigned) throw new AppError('You cannot attach media to this complaint.', 403);
    const media = await ComplaintMedia.create({ complaint_id: complaint._id, file_url: `/uploads/${req.file.filename}`, media_type: mediaType(req.file.mimetype) });
    return success(res, media, 'Media uploaded.', 201);
  } catch (error) { next(error); }
}
module.exports = { uploadMedia };
