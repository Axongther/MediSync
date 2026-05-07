import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarMedico from '../../components/layout/SidebarMedico';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function MisPacientes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Obtener el doctor_id del médico logueado, luego sus citas para extraer pacientes únicos
    api.getMedicos()
      .then(medicos => {
        const m = medicos.find(m => m.email === user.email);
        if (!m) return [];
        return api.getCitasByMedico(m.id, {});
      })
      .then(citas => {
        // Deduplicar pacientes por patient_id
        const seen = new Set();
        const unique = citas.filter(c => {
          if (seen.has(c.patient_id)) return false;
          seen.add(c.patient_id);
          return true;
        });
        setPacientes(unique);
      })
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = pacientes.filter(p =>
    !search ||
    p.paciente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.paciente_telefono?.includes(search)
  );

  return (
    <div className="layout">
      <SidebarMedico />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Mis Pacientes</h1>
          <input
            className="search-input"
            placeholder="Buscar paciente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="table-card">
          {loading ? (
            <p style={{ color: '#888', padding: 12 }}>Cargando...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#888', padding: 12 }}>No se encontraron pacientes</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Especialidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.patient_id}>
                    <td>{p.paciente_nombre}</td>
                    <td>{p.paciente_telefono || '—'}</td>
                    <td>{p.medico_especialidad}</td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() => navigate(`/medico/pacientes/${p.patient_id}`)}
                      >
                        Ver perfil
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

export default MisPacientes;
