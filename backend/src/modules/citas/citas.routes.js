const router = require('express').Router();
const controller = require('./citas.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/', auth, controller.getAll);
router.get('/medico/:id', auth, controller.getByMedico);
router.get('/paciente/:id', auth, controller.getByPaciente);
router.get('/dia/:fecha', auth, controller.getByDia);
router.get('/:id', auth, controller.getById);
router.post('/', auth, roleCheck('recepcionista', 'paciente', 'director'), controller.create);
router.put('/:id', auth, controller.update);
router.patch('/:id/cancelar', auth, controller.cancelar);
router.patch('/:id/completar', auth, roleCheck('medico', 'director'), controller.completar);

module.exports = router;