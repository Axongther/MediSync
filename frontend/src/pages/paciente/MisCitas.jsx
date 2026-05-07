import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPaciente from '../../components/layout/SidebarPaciente';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function MisCitas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    // Obtener patient_id del usuario
    api.getPacientes()
      .then(pacientes => {
        const p = pacientes.find(p => p.email === user.email);
        if (p) return api.getCitasByPaciente(p.id);
        return [];
      })
      .then(data => setCitas(data))
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = citas.filter(c =>
    !search || c.medico_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.appointment_date?.includes(search)
  );

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="layout">
      <SidebarPaciente />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Mis Citas</h1>
          <input
            className="search-input"
            placeholder="Buscar citas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? <div className="loading" style={{ minHeight: 200 }}>Cargando...</div> : (
          <div className="citas-grid">
            {filtered.length === 0 ? (
              <p style={{ color: '#888' }}>No tienes citas registradas</p>
            ) : filtered.map(c => (
              <div key={c.id} className="cita-card" onClick={() => navigate(`/paciente/citas/${c.id}`)}>
                <div className="cita-card-header">
                  <div className="cita-fecha">
                    <span>{formatFecha(c.appointment_date)}</span>
                  </div>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
                <div className="cita-info">
                  <div>{c.appointment_time}</div>
                  <div>{c.medico_nombre}</div>
                </div>
                <button
                  className="btn-outline-danger"
                  onClick={e => {
                    e.stopPropagation();
                    if (window.confirm('¿Cancelar esta cita?')) {
                      api.cancelarCita(c.id, 'Cancelada por el paciente')
                        .then(() => setCitas(prev => prev.map(x => x.id === c.id ? { ...x, status: 'cancelada' } : x)));
                    }
                  }}
                  disabled={c.status === 'cancelada' || c.status === 'completada'}
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default MisCitas;
