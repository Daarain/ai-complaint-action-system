const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { uploadMedia } = require('../controllers/media.controller');
router.post('/complaints/:complaintId', protect, upload.single('file'), uploadMedia);
module.exports = router;
