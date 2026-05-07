import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SidebarMedico() {
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
          <span>Médico</span>
        </div>
      </div>
      <nav>
        <NavLink to="/medico/agenda">Mi Agenda</NavLink>
        <NavLink to="/medico/pacientes">Mis Pacientes</NavLink>
      </nav>
      <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
    </aside>
  );
}

export default SidebarMedico;
