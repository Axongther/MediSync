import { useState, useEffect } from 'react';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

function Configuracion() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const fetchUsuarios = () => {
    setLoading(true);
    api.getUsuarios()
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleRoleChange = async (id, role) => {
    setSaving(id);
    try {
      await api.changeRole(id, role);
      fetchUsuarios();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (id) => {
    setSaving(id);
    try {
      await api.toggleUsuario(id);
      fetchUsuarios();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const ROLES = ['paciente', 'medico', 'recepcionista', 'director'];

  return (
    <div className="layout">
      <SidebarDirector />
      <main className="content">
        <h1 className="page-title">Configuración</h1>

        <div className="table-card">
          <h3 style={{ marginBottom: 16 }}>Gestión de Usuarios</h3>
          {loading ? <p style={{ color: '#888' }}>Cargando...</p> : (
            <table>
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ fontSize: 13, color: '#666' }}>{u.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={saving === u.id}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-confirmada' : 'badge-cancelada'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn-action ${u.is_active ? 'btn-action-danger' : ''}`}
                        onClick={() => handleToggle(u.id)}
                        disabled={saving === u.id}
                      >
                        {saving === u.id ? '...' : u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default Configuracion;
