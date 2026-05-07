const router = require('express').Router();
const controller = require('./expedientes.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.get('/paciente/:id', auth, controller.getByPaciente);
router.post('/', auth, roleCheck('medico', 'director'), controller.create);
router.put('/:id', auth, roleCheck('medico', 'director'), controller.update);
router.post('/:id/adjuntos', auth, roleCheck('medico', 'director'), controller.uploadAdjunto);
router.get('/:id/adjuntos', auth, controller.getAdjuntos);
router.delete('/:id/adjuntos/:archivoId', auth, roleCheck('medico', 'director'), controller.deleteAdjunto);

module.exports = router;