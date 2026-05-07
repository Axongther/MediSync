import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SidebarDirector() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2><span className="logo-medi">Medi</span><span className="logo-sync">Sync</span></h2>
      </div>
      <div className="sidebar-user">
        <div className="avatar">{user?.name?.charAt(0)}</div>
        <div className="info">
          <strong>{user?.name}</strong>
          <span>Director</span>
        </div>
      </div>
      <nav>
        <NavLink to="/director/dashboard">Dashboard</NavLink>
        <NavLink to="/director/agenda">Agenda</NavLink>
        <NavLink to="/director/pacientes">Pacientes</NavLink>
        <NavLink to="/director/medicos">Catálogo de Médicos</NavLink>
        <NavLink to="/director/cancelaciones">Reportes</NavLink>
        <NavLink to="/director/configuracion">Configuración</NavLink>
      </nav>
      <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
    </aside>
  );
}

export default SidebarDirector;