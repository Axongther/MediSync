const pool = require('../../config/db');

const getResumen = async () => {
  const [atendidosHoy] = await pool.query(
    "SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = CURDATE() AND status = 'completada'"
  );

  const [citasMes] = await pool.query(
    "SELECT COUNT(*) AS total FROM appointments WHERE MONTH(appointment_date) = MONTH(CURDATE()) AND YEAR(appointment_date) = YEAR(CURDATE()) AND status IN ('confirmada', 'completada')"
  );

  const [ingresos] = await pool.query(
    `SELECT COALESCE(SUM(d.consultation_cost), 0) AS total
     FROM appointments a JOIN doctors d ON a.doctor_id = d.id
     WHERE MONTH(a.appointment_date) = MONTH(CURDATE())
     AND YEAR(a.appointment_date) = YEAR(CURDATE())
     AND a.status IN ('confirmada', 'completada')`
  );

  const [cancel] = await pool.query(
    `SELECT COUNT(*) AS total_citas,
       SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) AS canceladas
     FROM appointments
     WHERE MONTH(appointment_date) = MONTH(CURDATE())
     AND YEAR(appointment_date) = YEAR(CURDATE())`
  );
  const tasa = cancel[0].total_citas > 0
    ? ((cancel[0].canceladas / cancel[0].total_citas) * 100).toFixed(1)
    : 0;

  const [proximas] = await pool.query(
    `SELECT a.*, u_p.name AS paciente, u_d.name AS medico, d.specialty
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     JOIN users u_p ON p.user_id = u_p.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN users u_d ON d.user_id = u_d.id
     WHERE a.appointment_date = CURDATE() AND a.status = 'confirmada'
     ORDER BY a.appointment_time LIMIT 10`
  );

  return {
    pacientes_atendidos_hoy: atendidosHoy[0].total,
    citas_confirmadas_mes: citasMes[0].total,
    ingresos_estimados_mes: ingresos[0].total,
    tasa_cancelacion: parseFloat(tasa),
    proximas_citas: proximas
  };
};

const getPacientesAtendidos = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(DISTINCT patient_id) AS total FROM appointments WHERE status = 'completada'"
  );
  return rows[0];
};

const getCitasPorMedico = async () => {
  const [rows] = await pool.query(
    `SELECT u.name AS medico, d.specialty, COUNT(a.id) AS total_citas,
       SUM(CASE WHEN a.status = 'completada' THEN 1 ELSE 0 END) AS completadas,
       SUM(CASE WHEN a.status = 'cancelada' THEN 1 ELSE 0 END) AS canceladas
     FROM doctors d JOIN users u ON d.user_id = u.id
     LEFT JOIN appointments a ON d.id = a.doctor_id
     WHERE d.is_active = TRUE GROUP BY d.id
     ORDER BY total_citas DESC`
  );
  return rows;
};

const getIngresos = async () => {
  const [rows] = await pool.query(
    `SELECT MONTH(a.appointment_date) AS mes,
       COALESCE(SUM(d.consultation_cost), 0) AS ingresos
     FROM appointments a JOIN doctors d ON a.doctor_id = d.id
     WHERE a.status IN ('confirmada', 'completada')
     AND YEAR(a.appointment_date) = YEAR(CURDATE())
     GROUP BY MONTH(a.appointment_date) ORDER BY mes`
  );
  return rows;
};

const getCancelaciones = async () => {
  const [porMedico] = await pool.query(
    `SELECT u.name AS medico, COUNT(cl.id) AS total_cancelaciones
     FROM cancellation_log cl
     JOIN appointments a ON cl.appointment_id = a.id
     JOIN doctors d ON a.doctor_id = d.id
     JOIN users u ON d.user_id = u.id
     GROUP BY d.id ORDER BY total_cancelaciones DESC`
  );

  const [porMotivo] = await pool.query(
    'SELECT reason, COUNT(*) AS total FROM cancellation_log GROUP BY reason ORDER BY total DESC'
  );

  const [porResponsable] = await pool.query(
    'SELECT cancelled_by, COUNT(*) AS total FROM cancellation_log GROUP BY cancelled_by'
  );

  const [tendencia] = await pool.query(
    `SELECT DATE_FORMAT(cancelled_at, '%Y-%m') AS mes, COUNT(*) AS total
     FROM cancellation_log WHERE YEAR(cancelled_at) = YEAR(CURDATE())
     GROUP BY DATE_FORMAT(cancelled_at, '%Y-%m') ORDER BY mes`
  );

  return { por_medico: porMedico, por_motivo: porMotivo, por_responsable: porResponsable, tendencia };
};

module.exports = { getResumen, getPacientesAtendidos, getCitasPorMedico, getIngresos, getCancelaciones };