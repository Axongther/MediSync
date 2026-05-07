import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

function PerfilPaciente() {
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
      <SidebarDirector />
      <main className="content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-back" onClick={() => navigate('/director/pacientes')}>← Pacientes</button>
          <h1 className="page-title" style={{ margin: 0 }}>Perfil del Paciente</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Info del paciente */}
          <div className="table-card" style={{ textAlign: 'center' }}>
            <div className="avatar-lg">{paciente?.name?.charAt(0)}</div>
            <h3 style={{ marginTop: 12, marginBottom: 16 }}>{paciente?.name}</h3>
            <div className="info-list">
              <div className="info-row"><span>Edad:</span><span>{paciente?.age || '—'}</span></div>
              <div className="info-row"><span>Tipo de Sangre:</span><span>{paciente?.blood_type || '—'}</span></div>
              <div className="info-row"><span>Alergias:</span><span>{paciente?.allergies || '—'}</span></div>
              <div className="info-row"><span>Contacto:</span><span>{paciente?.phone || '—'}</span></div>
              <div className="info-row"><span>Email:</span><span style={{ fontSize: 12 }}>{paciente?.email}</span></div>
            </div>
          </div>

          {/* Expediente */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Expediente Médico</h2>
            </div>
            {expediente.length === 0 ? (
              <div className="table-card"><p style={{ color: '#888' }}>Sin registros médicos</p></div>
            ) : (
              expediente.map(r => (
                <div key={r.id} className="expediente-card">
                  <div className="expediente-header">
                    <span className="expediente-fecha">{r.record_date}</span>
                    <span style={{ color: '#888', fontSize: 13 }}>{r.doctor_nombre} — {r.specialty}</span>
                  </div>
                  <div className="expediente-body">
                    <div className="exp-field"><label>Razón de la visita:</label><span>{r.visit_reason || '—'}</span></div>
                    <div className="exp-field"><label>Doctor que lo atendió:</label><span>{r.doctor_nombre}</span></div>
                    <div className="exp-field"><label>Diagnóstico:</label><span>{r.diagnosis || '—'}</span></div>
                    <div className="exp-field"><label>Tratamiento:</label><span>{r.treatment || '—'}</span></div>
                    <div className="exp-field"><label>Notas:</label><span>{r.notes || '—'}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default PerfilPaciente;
