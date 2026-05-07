import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarRecepcionista from '../../components/layout/SidebarRecepcionista';
import api from '../../services/api';

function BuscarPaciente() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.getPacientes(search);
      setPacientes(data);
      setSearched(true);
    } catch (err) {
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <SidebarRecepcionista />
      <main className="content">
        <h1 className="page-title">Buscar Paciente</h1>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24, maxWidth: 500 }}>
          <input
            className="search-input"
            style={{ flex: 1 }}
            placeholder="Nombre, teléfono o ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', margin: 0 }}>Buscar</button>
        </form>

        {loading && <p style={{ color: '#888' }}>Buscando...</p>}

        {searched && !loading && (
          <div className="table-card">
            {pacientes.length === 0 ? (
              <p style={{ color: '#888' }}>No se encontraron pacientes con ese criterio</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Tipo de Sangre</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {pacientes.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.phone || '—'}</td>
                      <td>{p.blood_type || '—'}</td>
                      <td>
                        <button className="btn-action" onClick={() => navigate(`/recepcionista/agendar?paciente=${p.id}`)}>
                          Agendar cita
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default BuscarPaciente;
