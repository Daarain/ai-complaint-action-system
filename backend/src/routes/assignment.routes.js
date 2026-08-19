const router = require('express').Router();
const controller = require('../controllers/assignment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
router.use(protect, authorize('admin'));
router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
module.exports = router;
