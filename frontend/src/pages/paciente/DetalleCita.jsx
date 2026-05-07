import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarPaciente from '../../components/layout/SidebarPaciente';
import api from '../../services/api';

function DetalleCita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCita(id)
      .then(data => setCita(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancelar = async () => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    try {
      await api.cancelarCita(id, 'Cancelada por el paciente');
      setCita(prev => ({ ...prev, status: 'cancelada' }));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!cita) return <div className="loading">Cita no encontrada</div>;

  return (
    <div className="layout">
      <SidebarPaciente />
      <main className="content">
        <button className="btn-back" onClick={() => navigate('/paciente/citas')} style={{ marginBottom: 16 }}>
          ← Mis Citas
        </button>

        <div className="detalle-cita-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#4169E1' }}>Detalle de Cita</h1>
            <span className={`badge badge-${cita.status}`} style={{ fontSize: 14, padding: '6px 16px' }}>{cita.status}</span>
          </div>

          <div className="detalle-grid">
            <div className="detalle-item">
              <div>
                <label>Fecha</label>
                <strong>{formatFecha(cita.appointment_date)}</strong>
              </div>
            </div>
            <div className="detalle-item">
              <div>
                <label>Médico</label>
                <strong>{cita.medico_nombre}</strong>
                <span style={{ fontSize: 13, color: '#888' }}>{cita.medico_especialidad}</span>
              </div>
            </div>
            <div className="detalle-item">
              <div>
                <label>Hora</label>
                <strong>{cita.appointment_time}</strong>
              </div>
            </div>
            <div className="detalle-item">
              <div>
                <label>Consultorio</label>
                <strong>{cita.consultorio ? `Consultorio #${cita.consultorio}` : '—'}</strong>
                <span style={{ fontSize: 13, color: '#888' }}>{cita.consultorio_direccion || ''}</span>
              </div>
            </div>
          </div>

          {cita.reason && (
            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Motivo:</label>
              <p style={{ color: '#555' }}>{cita.reason}</p>
            </div>
          )}
          {cita.instructions && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Indicaciones:</label>
              <p style={{ color: '#555' }}>{cita.instructions}</p>
            </div>
          )}

          {cita.status === 'completada' && (
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => navigate(`/paciente/calificar/${cita.id}`)}>
                Calificar al médico
              </button>
            </div>
          )}

          {(cita.status === 'pendiente' || cita.status === 'confirmada') && (
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn-outline" onClick={() => navigate('/paciente/citas')}>Reprogramar cita</button>
              <button className="btn-outline-danger" onClick={handleCancelar}>Cancelar Cita</button>
            </div>
          )}
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default DetalleCita;
