import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';

// Director
import Dashboard from './pages/director/Dashboard';
import Agenda from './pages/director/Agenda';
import Pacientes from './pages/director/Pacientes';
import PerfilPaciente from './pages/director/PerfilPaciente';
import CatalogoMedicos from './pages/director/CatalogoMedicos';
import MetricasCancelaciones from './pages/director/MetricasCancelaciones';
import Configuracion from './pages/director/Configuracion';

// Médico
import MiAgenda from './pages/medico/MiAgenda';
import MisPacientes from './pages/medico/MisPacientes';
import ConsultaActiva from './pages/medico/ConsultaActiva';
import PerfilPacienteMedico from './pages/medico/PerfilPacienteMedico';

// Paciente
import MisCitas from './pages/paciente/MisCitas';
import DetalleCita from './pages/paciente/DetalleCita';
import MiExpediente from './pages/paciente/MiExpediente';
import Notificaciones from './pages/paciente/Notificaciones';
import CalificarDoctor from './pages/paciente/CalificarDoctor';

// Recepcionista
import AgendaDiaria from './pages/recepcionista/AgendaDiaria';
import AgendarCita from './pages/recepcionista/AgendarCita';
import BuscarPaciente from './pages/recepcionista/BuscarPaciente';
import RegistroPaciente from './pages/recepcionista/RegistroPaciente';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;

  const getHome = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'paciente': return '/paciente/citas';
      case 'medico': return '/medico/agenda';
      case 'recepcionista': return '/recepcionista/agenda';
      case 'director': return '/director/dashboard';
      default: return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Director */}
      <Route path="/director/dashboard" element={<ProtectedRoute roles={['director']}><Dashboard /></ProtectedRoute>} />
      <Route path="/director/agenda" element={<ProtectedRoute roles={['director']}><Agenda /></ProtectedRoute>} />
      <Route path="/director/pacientes" element={<ProtectedRoute roles={['director']}><Pacientes /></ProtectedRoute>} />
      <Route path="/director/pacientes/:id" element={<ProtectedRoute roles={['director']}><PerfilPaciente /></ProtectedRoute>} />
      <Route path="/director/medicos" element={<ProtectedRoute roles={['director']}><CatalogoMedicos /></ProtectedRoute>} />
      <Route path="/director/cancelaciones" element={<ProtectedRoute roles={['director']}><MetricasCancelaciones /></ProtectedRoute>} />
      <Route path="/director/configuracion" element={<ProtectedRoute roles={['director']}><Configuracion /></ProtectedRoute>} />

      {/* Médico */}
      <Route path="/medico/agenda" element={<ProtectedRoute roles={['medico']}><MiAgenda /></ProtectedRoute>} />
      <Route path="/medico/pacientes" element={<ProtectedRoute roles={['medico']}><MisPacientes /></ProtectedRoute>} />
      <Route path="/medico/consulta/:id" element={<ProtectedRoute roles={['medico']}><ConsultaActiva /></ProtectedRoute>} />
      <Route path="/medico/pacientes/:id" element={<ProtectedRoute roles={['medico']}><PerfilPacienteMedico /></ProtectedRoute>} />

      {/* Paciente */}
      <Route path="/paciente/citas" element={<ProtectedRoute roles={['paciente']}><MisCitas /></ProtectedRoute>} />
      <Route path="/paciente/citas/:id" element={<ProtectedRoute roles={['paciente']}><DetalleCita /></ProtectedRoute>} />
      <Route path="/paciente/expediente" element={<ProtectedRoute roles={['paciente']}><MiExpediente /></ProtectedRoute>} />
      <Route path="/paciente/notificaciones" element={<ProtectedRoute roles={['paciente']}><Notificaciones /></ProtectedRoute>} />
      <Route path="/paciente/calificar/:citaId" element={<ProtectedRoute roles={['paciente']}><CalificarDoctor /></ProtectedRoute>} />

      {/* Recepcionista */}
      <Route path="/recepcionista/agenda" element={<ProtectedRoute roles={['recepcionista']}><AgendaDiaria /></ProtectedRoute>} />
      <Route path="/recepcionista/agendar" element={<ProtectedRoute roles={['recepcionista']}><AgendarCita /></ProtectedRoute>} />
      <Route path="/recepcionista/pacientes" element={<ProtectedRoute roles={['recepcionista']}><BuscarPaciente /></ProtectedRoute>} />
      <Route path="/recepcionista/registro" element={<ProtectedRoute roles={['recepcionista']}><RegistroPaciente /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={getHome()} />} />
    </Routes>
  );
}

export default App;
