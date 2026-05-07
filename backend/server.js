const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./src/modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

const pacientesRoutes = require('./src/modules/pacientes/pacientes.routes');
app.use('/api/pacientes', pacientesRoutes);

const medicosRoutes = require('./src/modules/medicos/medicos.routes');
app.use('/api/medicos', medicosRoutes);

const citasRoutes = require('./src/modules/citas/citas.routes');
app.use('/api/citas', citasRoutes);

const expedientesRoutes = require('./src/modules/expedientes/expedientes.routes');
app.use('/api/expedientes', expedientesRoutes);

const notificacionesRoutes = require('./src/modules/notificaciones/notificaciones.routes');
app.use('/api/notificaciones', notificacionesRoutes);

const calificacionesRoutes = require('./src/modules/calificaciones/calificaciones.routes');
app.use('/api/calificaciones', calificacionesRoutes);

const dashboardRoutes = require('./src/modules/dashboard/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

const slotsRoutes = require('./src/modules/slots/slots.routes');
app.use('/api/slots', slotsRoutes);

const usuariosRoutes = require('./src/modules/usuarios/usuarios.routes');
app.use('/api/usuarios', usuariosRoutes);

// Ruta de health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediSync API funcionando' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MediSync API corriendo en puerto ${PORT}`);
}).on('error', (err) => {
  console.error('Error:', err.message);
});