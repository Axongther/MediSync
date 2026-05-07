import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SidebarRecepcionista() {
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
          <span>Recepcionista</span>
        </div>
      </div>
      <nav>
        <NavLink to="/recepcionista/agenda">Agenda Diaria</NavLink>
        <NavLink to="/recepcionista/agendar">Agendar Cita</NavLink>
        <NavLink to="/recepcionista/pacientes">Buscar Paciente</NavLink>
        <NavLink to="/recepcionista/registro">Registro Paciente</NavLink>
      </nav>
      <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
    </aside>
  );
}

export default SidebarRecepcionista;
