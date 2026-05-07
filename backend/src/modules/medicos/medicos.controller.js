const service = require('./medicos.service');

const getAll = async (req, res) => {
  try { res.json(await service.getAll()); }
  catch (error) { console.error('Error en getAll medicos:', error); res.status(500).json({ error: 'Error al obtener médicos' }); }
};

const getById = async (req, res) => {
  try {
    const medico = await service.getById(req.params.id);
    if (!medico) return res.status(404).json({ error: 'Médico no encontrado' });
    res.json(medico);
  } catch (error) { console.error('Error en getById medico:', error); res.status(500).json({ error: 'Error al obtener médico' }); }
};

const getHorarios = async (req, res) => {
  try { res.json(await service.getHorarios(req.params.id)); }
  catch (error) { console.error('Error en getHorarios:', error); res.status(500).json({ error: 'Error al obtener horarios' }); }
};

const getSlotsDisponibles = async (req, res) => {
  try { res.json(await service.getSlotsDisponibles(req.params.id, req.params.fecha)); }
  catch (error) { console.error('Error en getSlotsDisponibles:', error); res.status(500).json({ error: 'Error al obtener slots' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await service.create(req.body)); }
  catch (error) {
    console.error('Error en create medico:', error);
    if (error.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: 'Error al crear médico' });
  }
};

const update = async (req, res) => {
  try { res.json(await service.update(req.params.id, req.body)); }
  catch (error) { console.error('Error en update medico:', error); res.status(500).json({ error: 'Error al actualizar médico' }); }
};

const deactivate = async (req, res) => {
  try { await service.deactivate(req.params.id); res.json({ message: 'Médico desactivado' }); }
  catch (error) { console.error('Error en deactivate medico:', error); res.status(500).json({ error: 'Error al desactivar médico' }); }
};

module.exports = { getAll, getById, getHorarios, getSlotsDisponibles, create, update, deactivate };