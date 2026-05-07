import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarMedico from '../../components/layout/SidebarMedico';
import api from '../../services/api';

function PerfilPacienteMedico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [expediente, setExpediente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPaciente(id), api.getExpediente(id)])
      .then(([p, e]) => { setPaciente(p); setExpediente(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="layout">
      <SidebarMedico />
      <main className="content">
        <button className="btn-back" onClick={() => navigate('/medico/agenda')} style={{ marginBottom: 16 }}>
          ← Mi Agenda
        </button>
        <h1 className="page-title">Perfil del Paciente</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
          <div className="table-card" style={{ textAlign: 'center' }}>
            <div className="avatar-lg">{paciente?.name?.charAt(0)}</div>
            <h3 style={{ marginTop: 12, marginBottom: 16 }}>{paciente?.name}</h3>
            <div className="info-list">
              <div className="info-row"><span>Edad:</span><span>{paciente?.age || '—'}</span></div>
              <div className="info-row"><span>Tipo de Sangre:</span><span>{paciente?.blood_type || '—'}</span></div>
              <div className="info-row"><span>Alergias:</span><span>{paciente?.allergies || '—'}</span></div>
              <div className="info-row"><span>Teléfono:</span><span>{paciente?.phone || '—'}</span></div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Expediente Médico</h2>
            {expediente.length === 0 ? (
              <div className="table-card"><p style={{ color: '#888' }}>Sin registros médicos</p></div>
            ) : expediente.map(r => (
              <div key={r.id} className="expediente-card">
                <div className="expediente-header">
                  <span className="expediente-fecha">{r.record_date}</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{r.doctor_nombre} — {r.specialty}</span>
                </div>
                <div className="expediente-body">
                  <div className="exp-field"><label>Diagnóstico:</label><span>{r.diagnosis || '—'}</span></div>
                  <div className="exp-field"><label>Tratamiento:</label><span>{r.treatment || '—'}</span></div>
                  <div className="exp-field"><label>Notas:</label><span>{r.notes || '—'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default PerfilPacienteMedico;
