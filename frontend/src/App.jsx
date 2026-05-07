import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/director/Dashboard';

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
      <Route path="/director/dashboard" element={<Dashboard />} />
      <Route path="/paciente/citas" element={<h1>Mis Citas</h1>} />
      <Route path="/medico/agenda" element={<h1>Mi Agenda</h1>} />
      <Route path="/recepcionista/agenda" element={<h1>Agenda Diaria</h1>} />
      <Route path="*" element={<Navigate to={getHome()} />} />
    </Routes>
  );
}

export default App;