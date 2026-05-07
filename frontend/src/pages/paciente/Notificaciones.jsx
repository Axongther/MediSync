import { useState, useEffect } from 'react';
import SidebarPaciente from '../../components/layout/SidebarPaciente';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TIPO_ICON = { confirmacion: '+', recordatorio: 'i', cancelacion: 'x' };
const TIPO_COLOR = { confirmacion: '#27ae60', recordatorio: '#e67e22', cancelacion: '#e74c3c' };

function Notificaciones() {
  const { user } = useAuth();
  const [data, setData] = useState({ notifications: [], counts: {} });
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  const fetchNotifs = (f) => {
    if (!user) return;
    const filterParam = f === 'todas' ? '' : f === 'no_leidas' ? 'no_leidas' : 'leidas';
    api.getNotificaciones(user.id, filterParam)
      .then(data => setData(data))
      .catch(() => setData({ notifications: [], counts: {} }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(filter); }, [user, filter]);

  const handleMarcarLeida = async (id) => {
    try {
      await api.marcarLeida(id);
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Hace ${mins} minutos`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs} hora${hrs > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(hrs / 24)} día(s)`;
  };

  return (
    <div className="layout">
      <SidebarPaciente />
      <main className="content">
        <h1 className="page-title">Notificaciones</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'todas', label: `Todas(${data.counts?.total || 0})` },
            { key: 'no_leidas', label: `No Leidas(${data.counts?.no_leidas || 0})` },
            { key: 'leidas', label: `Leidas(${data.counts?.leidas || 0})` },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? <div className="loading" style={{ minHeight: 200 }}>Cargando...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.notifications.length === 0 ? (
              <div className="table-card"><p style={{ color: '#888' }}>No hay notificaciones</p></div>
            ) : data.notifications.map(n => (
              <div key={n.id} className={`notif-card ${!n.is_read ? 'notif-unread' : ''}`}>
                <div className="notif-icon" style={{ background: TIPO_COLOR[n.type] + '22', color: TIPO_COLOR[n.type] }}>
                  {TIPO_ICON[n.type]}
                </div>
                <div className="notif-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{n.title}</strong>
                    <span style={{ fontSize: 12, color: '#aaa' }}>{timeAgo(n.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>{n.message}</p>
                </div>
                {!n.is_read && (
                  <button className="btn-action" onClick={() => handleMarcarLeida(n.id)}>
                    Marcar como leída
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default Notificaciones;
