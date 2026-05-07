import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarRecepcionista from '../../components/layout/SidebarRecepcionista';
import api from '../../services/api';

const EMPTY = { email: '', password: '', name: '', age: '', blood_type: '', allergies: '', phone: '', address: '' };

function RegistroPaciente() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createPaciente(form);
      setSuccess(true);
      setForm(EMPTY);
      setTimeout(() => navigate('/recepcionista/agenda'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    { label: 'Nombre completo', key: 'name' },
    { label: 'Correo electrónico', key: 'email', type: 'email' },
    { label: 'Contraseña temporal', key: 'password', type: 'password' },
    { label: 'Edad', key: 'age', type: 'number' },
    { label: 'Tipo de sangre', key: 'blood_type', placeholder: 'Ej: O+' },
    { label: 'Alergias', key: 'allergies', placeholder: 'Ej: Polen, penicilina' },
    { label: 'Teléfono', key: 'phone', placeholder: '+52...' },
    { label: 'Dirección', key: 'address' },
  ];

  return (
    <div className="layout">
      <SidebarRecepcionista />
      <main className="content">
        <h1 className="page-title">Registro de Paciente</h1>

        <div className="detalle-cita-card" style={{ maxWidth: 520 }}>
          {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>✅ Paciente registrado exitosamente</div>}
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {FIELDS.map(f => (
                <div key={f.key} style={{ gridColumn: f.key === 'address' || f.key === 'allergies' ? 'span 2' : 'span 1' }}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    className="form-input"
                    placeholder={f.placeholder || ''}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required={['name', 'email', 'password'].includes(f.key)}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="button" className="btn-outline" onClick={() => navigate('/recepcionista/agenda')}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', margin: 0 }} disabled={saving}>
                {saving ? 'Registrando...' : 'Registrar Paciente'}
              </button>
            </div>
          </form>
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default RegistroPaciente;
