const router = require('express').Router();
const controller = require('./medicos.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/horarios', controller.getHorarios);
router.get('/:id/slots-disponibles/:fecha', controller.getSlotsDisponibles);
router.post('/', auth, roleCheck('director'), controller.create);
router.put('/:id', auth, roleCheck('director', 'medico'), controller.update);
router.put('/:id/desactivar', auth, roleCheck('director'), controller.deactivate);

module.exports = router;