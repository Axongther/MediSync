const service = require('./notificaciones.service');

const getByUser = async (req, res) => {
  try { res.json(await service.getByUser(req.params.usuario_id, req.query.filter)); }
  catch (error) { console.error('Error en getByUser notificaciones:', error); res.status(500).json({ error: 'Error al obtener notificaciones' }); }
};

const markAsRead = async (req, res) => {
  try { res.json(await service.markAsRead(req.params.id)); }
  catch (error) { console.error('Error en markAsRead:', error); res.status(500).json({ error: 'Error al marcar notificación' }); }
};

module.exports = { getByUser, markAsRead };