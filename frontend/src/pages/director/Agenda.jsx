import { useState, useEffect } from 'react';
import SidebarDirector from '../../components/layout/SidebarDirector';
import api from '../../services/api';

const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function Agenda() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const handleDayClick = (day, current) => {
    if (!current) return;
    const fecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(fecha);
    setLoading(true);
    api.getCitasByDia(fecha)
      .then(data => setCitas(data))
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  };

  const isToday = (day, current) => current && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (day, current) => {
    if (!current || !selectedDate) return false;
    const d = selectedDate.split('-');
    return parseInt(d[2]) === day && parseInt(d[1]) - 1 === month && parseInt(d[0]) === year;
  };

  return (
    <div className="layout">
      <SidebarDirector />
      <main className="content">
        <h1 className="page-title">Agenda</h1>

        <div className="calendar-card">
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-month-label">{MESES[month]} {year}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="calendar-grid">
            {DIAS.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
            {cells.map((cell, i) => (
              <div
                key={i}
                className={`cal-cell ${!cell.current ? 'cal-other' : ''} ${isToday(cell.day, cell.current) ? 'cal-today' : ''} ${isSelected(cell.day, cell.current) ? 'cal-selected' : ''}`}
                onClick={() => handleDayClick(cell.day, cell.current)}
              >
                {cell.day}
              </div>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="table-card" style={{ marginTop: 20 }}>
            <h3>Citas del {selectedDate}</h3>
            {loading ? <p style={{ color: '#888', padding: '12px 0' }}>Cargando...</p> : citas.length === 0 ? (
              <p style={{ color: '#888', padding: '12px 0' }}>No hay citas para este día</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Hora</th><th>Paciente</th><th>Médico</th><th>Especialidad</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {citas.map(c => (
                    <tr key={c.id}>
                      <td>{c.appointment_time}</td>
                      <td>{c.paciente_nombre}</td>
                      <td>{c.medico_nombre}</td>
                      <td>{c.medico_especialidad}</td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <div className="footer">Mayo 2026 | Universidad Tecmilenio | Diseño y Arquitectura de Software | Proyecto Final</div>
      </main>
    </div>
  );
}

export default Agenda;
