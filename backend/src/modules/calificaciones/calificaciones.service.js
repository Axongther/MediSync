const pool = require('../../config/db');

const create = async ({ patient_id, doctor_id, appointment_id, rating, comment }) => {
  const [existing] = await pool.query(
    'SELECT id FROM doctor_ratings WHERE appointment_id = ?', [appointment_id]
  );
  if (existing.length > 0) throw new Error('ALREADY_RATED');

  const [result] = await pool.query(
    'INSERT INTO doctor_ratings (patient_id, doctor_id, appointment_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [patient_id, doctor_id, appointment_id, rating, comment]
  );

  return { id: result.insertId, message: 'Calificación registrada' };
};

const getByDoctor = async (doctorId) => {
  const [ratings] = await pool.query(
    `SELECT dr.*, u.name AS paciente_nombre
     FROM doctor_ratings dr
     JOIN patients p ON dr.patient_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE dr.doctor_id = ?
     ORDER BY dr.created_at DESC`, [doctorId]
  );

  const [avg] = await pool.query(
    'SELECT AVG(rating) AS promedio, COUNT(*) AS total FROM doctor_ratings WHERE doctor_id = ?', [doctorId]
  );

  return { ratings, promedio: avg[0].promedio || 0, total: avg[0].total };
};

module.exports = { create, getByDoctor };