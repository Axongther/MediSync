import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarMedico from '../../components/layout/SidebarMedico';
import api from '../../services/api';

function ConsultaActiva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cita, setCita] = useState(null);
  const [form, setForm] = useState({ visit_reason: '', diagnosis: '', treatment: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCita(id)
      .then(data => {
        setCita(data);
        setForm(prev => ({ ...prev, visit_reason: data.reason || '' }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createExpediente({
        patient_id: cita.patient_id,
        doctor_id: cita.doctor_id,
        appointment_id: parseInt(id),
        ...form
      });
      await api.completarCita(id);
      navigate('/medico/agenda');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="layout">
      <SidebarMedico />
      <main className="content">
        <button className="btn-back" onClick={() => navigate('/medico/agenda')} style={{ marginBottom: 16 }}>
          ← Mi Agenda
        </button>
        <h1 className="page-title">Consulta Activa</h1>

        {cita && (
          <div className="detalle-cita-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div><label style={{ fontSize: 12, color: '#888' }}>Paciente</label><p style={{ fontWeight: 600 }}>{cita.paciente_nombre}</p></div>
              <div><label style={{ fontSize: 12, color: '#888' }}>Fecha</label><p style={{ fontWeight: 600 }}>{cita.appointment_date}</p></div>
              <div><label style={{ fontSize: 12, color: '#888' }}>Hora</label><p style={{ fontWeight: 600 }}>{cita.appointment_time}</p></div>
              <div><label style={{ fontSize: 12, color: '#888' }}>Teléfono</label><p style={{ fontWeight: 600 }}>{cita.paciente_telefono || '—'}</p></div>
            </div>
          </div>
        )}

        <div className="detalle-cita-card">
          <h3 style={{ marginBottom: 16 }}>Registro de Consulta</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Razón de la visita', key: 'visit_reason' },
              { label: 'Diagnóstico', key: 'diagnosis' },
              { label: 'Tratamiento', key: 'treatment' },
              { label: 'Notas adicionales', key: 'notes' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 }}>{f.label}</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn-outline" onClick={() => navigate('/medico/agenda')}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', margin: 0 }} disabled={saving}>
                {saving ? 'Guardando...' : 'Finalizar Consulta'}
              </button>
            </div>
          </form>
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default ConsultaActiva;
