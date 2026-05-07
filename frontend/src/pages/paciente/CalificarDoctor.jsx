import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarPaciente from '../../components/layout/SidebarPaciente';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function CalificarDoctor() {
  const { citaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cita, setCita] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCita(citaId)
      .then(data => setCita(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [citaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Selecciona una calificación'); return; }
    setSaving(true);
    setError('');
    try {
      await api.calificarDoctor({
        patient_id: cita.patient_id,
        doctor_id: cita.doctor_id,
        appointment_id: parseInt(citaId),
        rating,
        comment
      });
      navigate('/paciente/citas');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="layout">
      <SidebarPaciente />
      <main className="content">
        <button className="btn-back" onClick={() => navigate('/paciente/citas')} style={{ marginBottom: 16 }}>
          ← Mis Citas
        </button>

        <div className="detalle-cita-card" style={{ maxWidth: 500 }}>
          <h2 style={{ marginBottom: 8 }}>Calificar al Médico</h2>
          {cita && (
            <p style={{ color: '#666', marginBottom: 24 }}>
              Cita con <strong>{cita.medico_nombre}</strong> el {cita.appointment_date}
            </p>
          )}

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 12 }}>Calificación</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', color: star <= (hover || rating) ? '#f39c12' : '#ddd' }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}</p>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Comentario (opcional)</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Comparte tu experiencia..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ margin: 0 }} disabled={saving}>
              {saving ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </form>
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default CalificarDoctor;
