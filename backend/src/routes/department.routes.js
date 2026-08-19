const router = require('express').Router();
const controller = require('../controllers/department.controller');
const { authorize } = require('../middleware/role.middleware');
const { protect } = require('../middleware/auth.middleware');
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', protect, authorize('admin'), controller.create);
router.patch('/:id', protect, authorize('admin'), controller.update);
module.exports = router;
