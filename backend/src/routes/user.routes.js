const router = require('express').Router();
const { me, updateMe, myComplaints } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateFilters } = require('../validators/complaint.validator');
router.use(protect);
router.get('/me', me);
router.patch('/me', updateMe);
router.get('/me/complaints', validateFilters, myComplaints);
module.exports = router;
