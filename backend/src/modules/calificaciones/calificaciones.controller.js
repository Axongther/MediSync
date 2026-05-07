const service = require('./calificaciones.service');

const create = async (req, res) => {
  try { res.status(201).json(await service.create(req.body)); }
  catch (error) {
    console.error('Error en create calificacion:', error);
    if (error.message === 'ALREADY_RATED') return res.status(409).json({ error: 'Ya calificaste esta cita' });
    res.status(500).json({ error: 'Error al crear calificación' });
  }
};

const getByDoctor = async (req, res) => {
  try { res.json(await service.getByDoctor(req.params.id)); }
  catch (error) { console.error('Error en getByDoctor calificaciones:', error); res.status(500).json({ error: 'Error al obtener calificaciones' }); }
};

module.exports = { create, getByDoctor };