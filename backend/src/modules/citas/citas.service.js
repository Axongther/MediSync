const pool = require('../../config/db');

const BASE_QUERY = `
  SELECT a.*, u_p.name AS paciente_nombre, p.phone AS paciente_telefono,
    u_d.name AS medico_nombre, d.specialty AS medico_especialidad,
    d.office_number AS consultorio, d.office_address AS consultorio_direccion
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN users u_p ON p.user_id = u_p.id
  JOIN doctors d ON a.doctor_id = d.id
  JOIN users u_d ON d.user_id = u_d.id`;

const getAll = async () => {
  const [rows] = await pool.query(BASE_QUERY + ' ORDER BY a.appointment_date DESC, a.appointment_time DESC');
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(BASE_QUERY + ' WHERE a.id = ?', [id]);
  return rows[0] || null;
};

const getByMedico = async (doctorId, query) => {
  let sql = BASE_QUERY + ' WHERE a.doctor_id = ?';
  const params = [doctorId];
  if (query && query.fecha) { sql += ' AND a.appointment_date = ?'; params.push(query.fecha); }
  if (query && query.status) { sql += ' AND a.status = ?'; params.push(query.status); }
  sql += ' ORDER BY a.appointment_date, a.appointment_time';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getByPaciente = async (patientId) => {
  const [rows] = await pool.query(BASE_QUERY + ' WHERE a.patient_id = ? ORDER BY a.appointment_date DESC', [patientId]);
  return rows;
};

const getByDia = async (fecha, medicoId) => {
  let sql = BASE_QUERY + ' WHERE a.appointment_date = ?';
  const params = [fecha];
  if (medicoId) { sql += ' AND a.doctor_id = ?'; params.push(medicoId); }
  sql += ' ORDER BY a.appointment_time';
  const [rows] = await pool.query(sql, params);
  return rows;
};

const create = async (data, user) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason, instructions } = data;

  const [existing] = await pool.query(
    "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelada'",
    [doctor_id, appointment_date, appointment_time]
  );
  if (existing.length > 0) throw new Error('SLOT_TAKEN');

  const [result] = await pool.query(
    "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [patient_id, doctor_id, appointment_date, appointment_time, user.role === 'paciente' ? 'pendiente' : 'confirmada', reason, instructions]
  );

  const [patient] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [patient_id]);
  if (patient.length > 0) {
    await pool.query(
      "INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'confirmacion', 'Cita Confirmada', ?)",
      [patient[0].user_id, `Tu cita del ${appointment_date} a las ${appointment_time} ha sido confirmada.`]
    );
  }

  return getById(result.insertId);
};

const update = async (id, data) => {
  const { appointment_date, appointment_time, reason, instructions } = data;
  await pool.query(
    'UPDATE appointments SET appointment_date = ?, appointment_time = ?, reason = ?, instructions = ? WHERE id = ?',
    [appointment_date, appointment_time, reason, instructions, id]
  );

  const cita = await getById(id);
  if (cita) {
    const [patient] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [cita.patient_id]);
    if (patient.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'confirmacion', 'Cita Modificada', ?)",
        [patient[0].user_id, `Tu cita ha sido reprogramada al ${appointment_date} a las ${appointment_time}.`]
      );
    }
  }

  return cita;
};

const cancelar = async (id, data, user) => {
  const { reason } = data;
  await pool.query("UPDATE appointments SET status = 'cancelada' WHERE id = ?", [id]);

  const cancelledBy = user.role === 'paciente' ? 'paciente' : user.role === 'medico' ? 'medico' : 'recepcionista';
  await pool.query(
    'INSERT INTO cancellation_log (appointment_id, cancelled_by, reason) VALUES (?, ?, ?)',
    [id, cancelledBy, reason || 'Sin motivo especificado']
  );

  const cita = await getById(id);
  if (cita) {
    const [patient] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [cita.patient_id]);
    if (patient.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'cancelacion', 'Cita Cancelada', ?)",
        [patient[0].user_id, `Tu cita del ${cita.appointment_date} ha sido cancelada. Motivo: ${reason || 'No especificado'}`]
      );
    }
  }

  return { message: 'Cita cancelada', id };
};

const completar = async (id) => {
  await pool.query("UPDATE appointments SET status = 'completada' WHERE id = ?", [id]);
  return getById(id);
};

module.exports = { getAll, getById, getByMedico, getByPaciente, getByDia, create, update, cancelar, completar };