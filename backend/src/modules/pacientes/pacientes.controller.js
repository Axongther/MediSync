const service = require('./pacientes.service');

const getAll = async (req, res) => {
  try {
    const pacientes = await service.getAll(req.query);
    res.json(pacientes);
  } catch (error) {
    console.error('Error en getAll pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

const getById = async (req, res) => {
  try {
    const paciente = await service.getById(req.params.id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (error) {
    console.error('Error en getById paciente:', error);
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
};

const create = async (req, res) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error en create paciente:', error);
    if (error.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'Correo ya registrado' });
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};

const update = async (req, res) => {
  try {
    const result = await service.update(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en update paciente:', error);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
};

const deactivate = async (req, res) => {
  try {
    await service.deactivate(req.params.id);
    res.json({ message: 'Paciente desactivado' });
  } catch (error) {
    console.error('Error en deactivate paciente:', error);
    res.status(500).json({ error: 'Error al desactivar paciente' });
  }
};

module.exports = { getAll, getById, create, update, deactivate };