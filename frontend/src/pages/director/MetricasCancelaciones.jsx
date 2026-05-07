import { useState, useEffect } from 'react';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

function MetricasCancelaciones() {
  const [data, setData] = useState(null);
  const [citasMedico, setCitasMedico] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCancelaciones(), api.getCitasPorMedico(), api.getIngresos()])
      .then(([c, cm, ing]) => { setData(c); setCitasMedico(cm); setIngresos(ing); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return (
    <div className="layout">
      <SidebarDirector />
      <main className="content">
        <h1 className="page-title">Reportes</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Cancelaciones por médico */}
          <div className="table-card">
            <h3>Cancelaciones por Médico</h3>
            <table>
              <thead><tr><th>Médico</th><th>Cancelaciones</th></tr></thead>
              <tbody>
                {(data?.por_medico || []).map((r, i) => (
                  <tr key={i}><td>{r.medico}</td><td>{r.total_cancelaciones}</td></tr>
                ))}
                {(data?.por_medico || []).length === 0 && <tr><td colSpan={2} style={{ color: '#888' }}>Sin datos</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Cancelaciones por responsable */}
          <div className="table-card">
            <h3>Cancelaciones por Responsable</h3>
            <table>
              <thead><tr><th>Cancelado por</th><th>Total</th></tr></thead>
              <tbody>
                {(data?.por_responsable || []).map((r, i) => (
                  <tr key={i}><td style={{ textTransform: 'capitalize' }}>{r.cancelled_by}</td><td>{r.total}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Citas por médico */}
        <div className="table-card" style={{ marginBottom: 20 }}>
          <h3>Citas por Médico</h3>
          <table>
            <thead><tr><th>Médico</th><th>Especialidad</th><th>Total</th><th>Completadas</th><th>Canceladas</th></tr></thead>
            <tbody>
              {citasMedico.map((r, i) => (
                <tr key={i}>
                  <td>{r.medico}</td>
                  <td>{r.specialty}</td>
                  <td>{r.total_citas}</td>
                  <td><span className="badge badge-completada">{r.completadas}</span></td>
                  <td><span className="badge badge-cancelada">{r.canceladas}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ingresos por mes */}
        <div className="table-card">
          <h3>Ingresos por Mes (Año actual)</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {ingresos.map((r, i) => (
              <div key={i} className="kpi-card blue" style={{ flex: '1 1 120px', minWidth: 120 }}>
                <h3>{MESES[r.mes - 1]}</h3>
                <div className="kpi-value" style={{ fontSize: 18 }}>${Number(r.ingresos).toLocaleString()}</div>
              </div>
            ))}
            {ingresos.length === 0 && <p style={{ color: '#888' }}>Sin datos de ingresos</p>}
          </div>
        </div>

        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default MetricasCancelaciones;
