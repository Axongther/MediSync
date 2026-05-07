import { useState, useEffect } from 'react';
import SidebarRecepcionista from '../../components/layout/SidebarRecepcionista';
import api from '../../services/api';

function AgendaDiaria() {
  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(today);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCitas = (f) => {
    setLoading(true);
    api.getCitasByDia(f)
      .then(data => setCitas(data))
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCitas(fecha); }, [fecha]);

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta cita?')) return;
    try {
      await api.cancelarCita(id, 'Cancelada por recepcionista');
      fetchCitas(fecha);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="layout">
      <SidebarRecepcionista />
      <main className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Agenda Diaria</h1>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={fecha}
            onChange={e => setFecha(e.target.value)}
          />
        </div>

        <div className="table-card">
          <h3 style={{ marginBottom: 12 }}>Citas del {fecha}</h3>
          {loading ? <p style={{ color: '#888' }}>Cargando...</p> : citas.length === 0 ? (
            <p style={{ color: '#888', padding: '12px 0' }}>No hay citas para este día</p>
          ) : (
            <table>
              <thead>
                <tr><th>Hora</th><th>Paciente</th><th>Médico</th><th>Especialidad</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.id}>
                    <td>{c.appointment_time}</td>
                    <td>{c.paciente_nombre}</td>
                    <td>{c.medico_nombre}</td>
                    <td>{c.medico_especialidad}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td>
                      {(c.status === 'pendiente' || c.status === 'confirmada') && (
                        <button className="btn-action btn-action-danger" onClick={() => handleCancelar(c.id)}>
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default AgendaDiaria;
