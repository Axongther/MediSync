import { useState, useEffect } from 'react';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

const EMPTY_FORM = { email: '', password: '', name: '', specialty: '', consultation_cost: '', office_number: '', office_address: '' };

function CatalogoMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMedicos = () => {
    setLoading(true);
    api.getMedicos()
      .then(data => setMedicos(data))
      .catch(() => setMedicos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedicos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.request('/medicos', { method: 'POST', body: JSON.stringify(form) });
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchMedicos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <SidebarDirector />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Catálogo de Médicos</h1>
          <button className="btn btn-primary" style={{ width: 'auto', margin: 0 }} onClick={() => setShowModal(true)}>+ Nuevo Médico</button>
        </div>

        <div className="table-card">
          {loading ? <p style={{ color: '#888', padding: 12 }}>Cargando...</p> : (
            <table>
              <thead>
                <tr><th>Nombre</th><th>Especialidad</th><th>Consultorio</th><th>Costo</th><th>Calificación</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {medicos.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.specialty || '—'}</td>
                    <td>{m.office_number ? `#${m.office_number}` : '—'}</td>
                    <td>${Number(m.consultation_cost || 0).toLocaleString()} MXN</td>
                    <td>⭐ {Number(m.avg_rating || 0).toFixed(1)} ({m.total_ratings})</td>
                    <td><span className={`badge ${m.is_active ? 'badge-confirmada' : 'badge-cancelada'}`}>{m.is_active ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: 16 }}>Nuevo Médico</h3>
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                {[
                  { label: 'Nombre', key: 'name' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Contraseña', key: 'password', type: 'password' },
                  { label: 'Especialidad', key: 'specialty' },
                  { label: 'Costo de consulta', key: 'consultation_cost', type: 'number' },
                  { label: 'Número de consultorio', key: 'office_number', type: 'number' },
                  { label: 'Dirección del consultorio', key: 'office_address' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      className="form-input"
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      required
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto', margin: 0 }} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default CatalogoMedicos;
