const bcrypt = require('bcryptjs');
const pool = require('../../config/db');

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT d.*, u.name, u.email,
       COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS total_ratings
     FROM doctors d JOIN users u ON d.user_id = u.id
     LEFT JOIN doctor_ratings r ON d.id = r.doctor_id
     WHERE d.is_active = TRUE GROUP BY d.id`
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT d.*, u.name, u.email,
       COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS total_ratings
     FROM doctors d JOIN users u ON d.user_id = u.id
     LEFT JOIN doctor_ratings r ON d.id = r.doctor_id
     WHERE d.id = ? AND d.is_active = TRUE GROUP BY d.id`, [id]
  );
  return rows[0] || null;
};

const getHorarios = async (doctorId) => {
  const [rows] = await pool.query(
    'SELECT * FROM time_slots WHERE doctor_id = ?', [doctorId]
  );
  return rows;
};

const getSlotsDisponibles = async (doctorId, fecha) => {
  const dayMap = { 0: 'dom', 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab' };
  const date = new Date(fecha + 'T12:00:00');
  const dayOfWeek = dayMap[date.getDay()];

  const [slots] = await pool.query(
    'SELECT * FROM time_slots WHERE doctor_id = ? AND day_of_week = ?', [doctorId, dayOfWeek]
  );

  const [booked] = await pool.query(
    "SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelada'",
    [doctorId, fecha]
  );
  const bookedTimes = booked.map(b => b.appointment_time);

  const available = [];
  for (const slot of slots) {
    let current = slot.start_time;
    while (current < slot.end_time) {
      if (!bookedTimes.includes(current)) available.push(current);
      const [h, m] = current.split(':').map(Number);
      const totalMin = h * 60 + m + slot.duration_minutes;
      current = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}:00`;
    }
  }

  return { doctor_id: doctorId, fecha, horarios_disponibles: available };
};

const create = async (data) => {
  const { email, password, name, specialty, consultation_cost, office_number, office_address } = data;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new Error('EMAIL_EXISTS');

  const password_hash = await bcrypt.hash(password, 10);

  const [userResult] = await pool.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [email, password_hash, name, 'medico']
  );

  const [doctorResult] = await pool.query(
    'INSERT INTO doctors (user_id, specialty, consultation_cost, office_number, office_address) VALUES (?, ?, ?, ?, ?)',
    [userResult.insertId, specialty, consultation_cost, office_number, office_address]
  );

  return { id: doctorResult.insertId, name, specialty };
};

const update = async (id, data) => {
  const { specialty, consultation_cost, office_number, office_address, photo_url } = data;
  await pool.query(
    'UPDATE doctors SET specialty = ?, consultation_cost = ?, office_number = ?, office_address = ?, photo_url = ? WHERE id = ?',
    [specialty, consultation_cost, office_number, office_address, photo_url, id]
  );
  return getById(id);
};

const deactivate = async (id) => {
  const [doctor] = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
  if (doctor.length > 0) {
    await pool.query('UPDATE doctors SET is_active = FALSE WHERE id = ?', [id]);
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [doctor[0].user_id]);
  }
};

module.exports = { getAll, getById, getHorarios, getSlotsDisponibles, create, update, deactivate };