import { useState, useEffect } from 'react';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="layout">
      <SidebarDirector />
      <main className="content">
        <h1 className="page-title">Dashboard Principal</h1>

        <div className="kpi-grid">
          <div className="kpi-card blue">
            <h3>Pacientes Atendidos Hoy</h3>
            <div className="kpi-value">{data?.pacientes_atendidos_hoy || 0}</div>
          </div>
          <div className="kpi-card green">
            <h3>Citas Confirmadas (Mes)</h3>
            <div className="kpi-value">{data?.citas_confirmadas_mes || 0}</div>
          </div>
          <div className="kpi-card purple">
            <h3>Ingresos Estimados (Mes)</h3>
            <div className="kpi-value">${Number(data?.ingresos_estimados_mes || 0).toLocaleString()} MXN</div>
          </div>
          <div className="kpi-card red">
            <h3>Tasa de Cancelación</h3>
            <div className="kpi-value">{data?.tasa_cancelacion || 0}%</div>
          </div>
        </div>

        <div className="table-card">
          <h3>Próximas Citas Hoy</h3>
          {data?.proximas_citas?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Especialidad</th>
                  <th>Médico</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.proximas_citas.map(cita => (
                  <tr key={cita.id}>
                    <td>{cita.paciente}</td>
                    <td>{cita.specialty}</td>
                    <td>{cita.medico}</td>
                    <td>{cita.appointment_time}</td>
                    <td><span className={`badge badge-${cita.status}`}>{cita.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#888', padding: '20px 0' }}>No hay citas programadas para hoy</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;