const router = require('express').Router();
const controller = require('./pacientes.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.post('/', auth, roleCheck('recepcionista', 'director'), controller.create);
router.put('/:id', auth, controller.update);
router.put('/:id/desactivar', auth, roleCheck('director'), controller.deactivate);

module.exports = router;