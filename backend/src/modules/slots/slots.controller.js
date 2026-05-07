const service = require('./slots.service');

const create = async (req, res) => {
  try { res.status(201).json(await service.create(req.body)); }
  catch (error) { console.error('Error en create slot:', error); res.status(500).json({ error: 'Error al crear slot' }); }
};

const update = async (req, res) => {
  try { res.json(await service.update(req.params.id, req.body)); }
  catch (error) { console.error('Error en update slot:', error); res.status(500).json({ error: 'Error al actualizar slot' }); }
};

const remove = async (req, res) => {
  try { await service.remove(req.params.id); res.json({ message: 'Slot eliminado' }); }
  catch (error) { console.error('Error en remove slot:', error); res.status(500).json({ error: 'Error al eliminar slot' }); }
};

module.exports = { create, update, remove };