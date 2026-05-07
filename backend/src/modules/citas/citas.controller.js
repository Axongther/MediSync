const service = require('./citas.service');

const getAll = async (req, res) => {
  try { res.json(await service.getAll()); }
  catch (error) { console.error('Error en getAll citas:', error); res.status(500).json({ error: 'Error al obtener citas' }); }
};

const getById = async (req, res) => {
  try {
    const cita = await service.getById(req.params.id);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(cita);
  } catch (error) { console.error('Error en getById cita:', error); res.status(500).json({ error: 'Error al obtener cita' }); }
};

const getByMedico = async (req, res) => {
  try { res.json(await service.getByMedico(req.params.id, req.query)); }
  catch (error) { console.error('Error en getByMedico:', error); res.status(500).json({ error: 'Error al obtener citas del médico' }); }
};

const getByPaciente = async (req, res) => {
  try { res.json(await service.getByPaciente(req.params.id)); }
  catch (error) { console.error('Error en getByPaciente:', error); res.status(500).json({ error: 'Error al obtener citas del paciente' }); }
};

const getByDia = async (req, res) => {
  try { res.json(await service.getByDia(req.params.fecha, req.query.medico_id)); }
  catch (error) { console.error('Error en getByDia:', error); res.status(500).json({ error: 'Error al obtener citas del día' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await service.create(req.body, req.user)); }
  catch (error) {
    console.error('Error en create cita:', error);
    if (error.message === 'SLOT_TAKEN') return res.status(409).json({ error: 'Ese horario ya está ocupado' });
    res.status(500).json({ error: 'Error al crear cita' });
  }
};

const update = async (req, res) => {
  try { res.json(await service.update(req.params.id, req.body)); }
  catch (error) { console.error('Error en update cita:', error); res.status(500).json({ error: 'Error al actualizar cita' }); }
};

const cancelar = async (req, res) => {
  try { res.json(await service.cancelar(req.params.id, req.body, req.user)); }
  catch (error) { console.error('Error en cancelar cita:', error); res.status(500).json({ error: 'Error al cancelar cita' }); }
};

const completar = async (req, res) => {
  try { res.json(await service.completar(req.params.id)); }
  catch (error) { console.error('Error en completar cita:', error); res.status(500).json({ error: 'Error al completar cita' }); }
};

module.exports = { getAll, getById, getByMedico, getByPaciente, getByDia, create, update, cancelar, completar };