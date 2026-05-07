import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SidebarPaciente() {
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
          <span>Paciente</span>
        </div>
      </div>
      <nav>
        <NavLink to="/paciente/citas">Inicio</NavLink>
        <NavLink to="/paciente/citas">Mis Citas</NavLink>
        <NavLink to="/paciente/expediente">Mi Expediente</NavLink>
        <NavLink to="/paciente/notificaciones">Notificaciones</NavLink>
      </nav>
      <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
    </aside>
  );
}

export default SidebarPaciente;
