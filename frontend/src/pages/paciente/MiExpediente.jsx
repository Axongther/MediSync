import { useState, useEffect } from 'react';
import SidebarPaciente from '../../components/layout/SidebarPaciente';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function MiExpediente() {
  const { user } = useAuth();
  const [expediente, setExpediente] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getPacientes()
      .then(pacientes => {
        const p = pacientes.find(p => p.email === user.email);
        if (p) {
          setPatientId(p.id);
          return api.getExpediente(p.id);
        }
        return [];
      })
      .then(data => setExpediente(data))
      .catch(() => setExpediente([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="layout">
      <SidebarPaciente />
      <main className="content">
        <h1 className="page-title">Mi Expediente Médico</h1>

        {loading ? <div className="loading" style={{ minHeight: 200 }}>Cargando...</div> : expediente.length === 0 ? (
          <div className="table-card"><p style={{ color: '#888' }}>No tienes registros médicos aún</p></div>
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
              {r.attachments?.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Archivos adjuntos:</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {r.attachments.map(a => (
                      <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="adjunto-chip">
                        {a.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default MiExpediente;
