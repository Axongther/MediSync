const router = require('express').Router();
const controller = require('./dashboard.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/resumen', auth, roleCheck('director'), controller.getResumen);
router.get('/pacientes-atendidos', auth, roleCheck('director'), controller.getPacientesAtendidos);
router.get('/citas-por-medico', auth, roleCheck('director'), controller.getCitasPorMedico);
router.get('/ingresos', auth, roleCheck('director'), controller.getIngresos);
router.get('/cancelaciones', auth, roleCheck('director'), controller.getCancelaciones);

module.exports = router;