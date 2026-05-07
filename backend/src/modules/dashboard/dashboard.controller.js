const service = require('./dashboard.service');

const getResumen = async (req, res) => {
  try { res.json(await service.getResumen()); }
  catch (error) { console.error('Error en getResumen:', error); res.status(500).json({ error: 'Error al obtener resumen' }); }
};

const getPacientesAtendidos = async (req, res) => {
  try { res.json(await service.getPacientesAtendidos()); }
  catch (error) { console.error('Error en getPacientesAtendidos:', error); res.status(500).json({ error: 'Error al obtener pacientes atendidos' }); }
};

const getCitasPorMedico = async (req, res) => {
  try { res.json(await service.getCitasPorMedico()); }
  catch (error) { console.error('Error en getCitasPorMedico:', error); res.status(500).json({ error: 'Error al obtener citas por médico' }); }
};

const getIngresos = async (req, res) => {
  try { res.json(await service.getIngresos()); }
  catch (error) { console.error('Error en getIngresos:', error); res.status(500).json({ error: 'Error al obtener ingresos' }); }
};

const getCancelaciones = async (req, res) => {
  try { res.json(await service.getCancelaciones()); }
  catch (error) { console.error('Error en getCancelaciones:', error); res.status(500).json({ error: 'Error al obtener cancelaciones' }); }
};

module.exports = { getResumen, getPacientesAtendidos, getCitasPorMedico, getIngresos, getCancelaciones };