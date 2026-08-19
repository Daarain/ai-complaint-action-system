const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { timeline } = require('../controllers/status.controller');
router.get('/complaints/:complaintId/timeline', protect, timeline);
module.exports = router;
