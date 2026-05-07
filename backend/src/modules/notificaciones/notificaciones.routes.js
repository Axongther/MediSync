const router = require('express').Router();
const controller = require('./notificaciones.controller');
const auth = require('../../middleware/auth');

router.get('/:usuario_id', auth, controller.getByUser);
router.put('/:id/leer', auth, controller.markAsRead);

module.exports = router;