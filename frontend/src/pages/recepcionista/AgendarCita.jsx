import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarRecepcionista from '../../components/layout/SidebarRecepcionista';
import api from '../../services/api';

function AgendarCita() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '', instructions: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getPacientes(), api.getMedicos()])
      .then(([p, m]) => { setPacientes(p); setMedicos(m); })
      .catch(console.error);
  }, []);

  const handleDateOrDoctorChange = (newForm) => {
    if (newForm.doctor_id && newForm.appointment_date) {
      api.getSlotsDisponibles(newForm.doctor_id, newForm.appointment_date)
        .then(data => setSlots(data.horarios_disponibles || []))
        .catch(() => setSlots([]));
    } else {
      setSlots([]);
    }
  };

  const handleChange = (key, value) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    if (key === 'doctor_id' || key === 'appointment_date') handleDateOrDoctorChange(newForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createCita(form);
      navigate('/recepcionista/agenda');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <SidebarRecepcionista />
      <main className="content">
        <h1 className="page-title">Agendar Cita</h1>

        <div className="detalle-cita-card" style={{ maxWidth: 560 }}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Paciente</label>
              <select className="form-input" value={form.patient_id} onChange={e => handleChange('patient_id', e.target.value)} required>
                <option value="">Seleccionar paciente...</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.name} — {p.email}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Médico</label>
              <select className="form-input" value={form.doctor_id} onChange={e => handleChange('doctor_id', e.target.value)} required>
                <option value="">Seleccionar médico...</option>
                {medicos.map(m => <option key={m.id} value={m.id}>{m.name} — {m.specialty}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={form.appointment_date} onChange={e => handleChange('appointment_date', e.target.value)} required />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Hora disponible</label>
              <select className="form-input" value={form.appointment_time} onChange={e => handleChange('appointment_time', e.target.value)} required disabled={slots.length === 0}>
                <option value="">{slots.length === 0 ? 'Selecciona médico y fecha primero' : 'Seleccionar hora...'}</option>
                {slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Motivo</label>
              <input type="text" className="form-input" value={form.reason} onChange={e => handleChange('reason', e.target.value)} placeholder="Motivo de la consulta" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Indicaciones previas</label>
              <textarea className="form-input" rows={2} value={form.instructions} onChange={e => handleChange('instructions', e.target.value)} placeholder="Ej: Venir en ayunas" style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn-outline" onClick={() => navigate('/recepcionista/agenda')}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', margin: 0 }} disabled={saving}>
                {saving ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default AgendarCita;
