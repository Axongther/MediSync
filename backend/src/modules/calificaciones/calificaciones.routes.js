const router = require('express').Router();
const controller = require('./calificaciones.controller');
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

router.post('/', auth, roleCheck('paciente'), controller.create);
router.get('/medico/:id', controller.getByDoctor);

module.exports = router;