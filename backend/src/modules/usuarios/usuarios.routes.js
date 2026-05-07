const router = require('express').Router();
const controller = require('./usuarios.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/', auth, roleCheck('director'), controller.getAll);
router.patch('/:id/role', auth, roleCheck('director'), controller.changeRole);
router.patch('/:id/toggle', auth, roleCheck('director'), controller.toggle);

module.exports = router;