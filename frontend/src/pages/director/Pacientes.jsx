import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPacientes = (q = '') => {
    setLoading(true);
    api.getPacientes(q)
      .then(data => setPacientes(data))
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPacientes(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPacientes(search);
  };

  return (
    <div className="layout">
      <SidebarDirector />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Pacientes</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              className="search-input"
              placeholder="Buscar paciente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', margin: 0 }}>Buscar</button>
          </form>
        </div>

        <div className="table-card">
          {loading ? <p style={{ color: '#888', padding: 12 }}>Cargando...</p> : pacientes.length === 0 ? (
            <p style={{ color: '#888', padding: 12 }}>No se encontraron pacientes</p>
          ) : (
            <table>
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Tipo de Sangre</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.blood_type || '—'}</td>
                    <td><span className={`badge ${p.is_active ? 'badge-confirmada' : 'badge-cancelada'}`}>{p.is_active ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <button className="btn-action" onClick={() => navigate(`/director/pacientes/${p.id}`)}>Ver perfil</button>
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

export default Pacientes;
