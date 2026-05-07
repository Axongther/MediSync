const pool = require('../../config/db');

const create = async (data) => {
  const { doctor_id, day_of_week, start_time, end_time, duration_minutes } = data;
  const [result] = await pool.query(
    'INSERT INTO time_slots (doctor_id, day_of_week, start_time, end_time, duration_minutes) VALUES (?, ?, ?, ?, ?)',
    [doctor_id, day_of_week, start_time, end_time, duration_minutes || 30]
  );
  return { id: result.insertId, message: 'Slot creado' };
};

const update = async (id, data) => {
  const { day_of_week, start_time, end_time, duration_minutes } = data;
  await pool.query(
    'UPDATE time_slots SET day_of_week = ?, start_time = ?, end_time = ?, duration_minutes = ? WHERE id = ?',
    [day_of_week, start_time, end_time, duration_minutes, id]
  );
  return { id, message: 'Slot actualizado' };
};

const remove = async (id) => {
  await pool.query('DELETE FROM time_slots WHERE id = ?', [id]);
};

module.exports = { create, update, remove };