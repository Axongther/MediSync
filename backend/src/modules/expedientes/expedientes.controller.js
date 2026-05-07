const service = require('./expedientes.service');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido'), false);
  }
}).single('file');

const getByPaciente = async (req, res) => {
  try { res.json(await service.getByPaciente(req.params.id)); }
  catch (error) { console.error('Error en getByPaciente expedientes:', error); res.status(500).json({ error: 'Error al obtener expediente' }); }
};

const create = async (req, res) => {
  try { res.status(201).json(await service.create(req.body)); }
  catch (error) { console.error('Error en create expediente:', error); res.status(500).json({ error: 'Error al crear registro médico' }); }
};

const update = async (req, res) => {
  try { res.json(await service.update(req.params.id, req.body)); }
  catch (error) { console.error('Error en update expediente:', error); res.status(500).json({ error: 'Error al actualizar registro médico' }); }
};

const uploadAdjunto = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No se envió ningún archivo' });
    try { res.status(201).json(await service.uploadAdjunto(req.params.id, req.file)); }
    catch (error) { console.error('Error en uploadAdjunto:', error); res.status(500).json({ error: 'Error al subir archivo' }); }
  });
};

const getAdjuntos = async (req, res) => {
  try { res.json(await service.getAdjuntos(req.params.id)); }
  catch (error) { console.error('Error en getAdjuntos:', error); res.status(500).json({ error: 'Error al obtener adjuntos' }); }
};

const deleteAdjunto = async (req, res) => {
  try { await service.deleteAdjunto(req.params.archivoId); res.json({ message: 'Adjunto eliminado' }); }
  catch (error) { console.error('Error en deleteAdjunto:', error); res.status(500).json({ error: 'Error al eliminar adjunto' }); }
};

module.exports = { getByPaciente, create, update, uploadAdjunto, getAdjuntos, deleteAdjunto };