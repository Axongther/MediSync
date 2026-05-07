const service = require('./usuarios.service');

const getAll = async (req, res) => {
  try { res.json(await service.getAll()); }
  catch (error) { console.error('Error en getAll usuarios:', error); res.status(500).json({ error: 'Error al obtener usuarios' }); }
};

const changeRole = async (req, res) => {
  try { res.json(await service.changeRole(req.params.id, req.body.role)); }
  catch (error) { console.error('Error en changeRole:', error); res.status(500).json({ error: 'Error al cambiar rol' }); }
};

const toggle = async (req, res) => {
  try { res.json(await service.toggle(req.params.id)); }
  catch (error) { console.error('Error en toggle usuario:', error); res.status(500).json({ error: 'Error al cambiar estado' }); }
};

module.exports = { getAll, changeRole, toggle };