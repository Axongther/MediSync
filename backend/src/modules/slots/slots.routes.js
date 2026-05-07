const router = require('express').Router();
const controller = require('./slots.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.post('/', auth, roleCheck('director'), controller.create);
router.put('/:id', auth, roleCheck('director'), controller.update);
router.delete('/:id', auth, roleCheck('director'), controller.remove);

module.exports = router;