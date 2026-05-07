const bcrypt = require('bcryptjs');
const pool = require('../../config/db');

const getAll = async (query) => {
  let sql = 'SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE p.is_active = TRUE';
  const params = [];

  if (query.search) {
    sql += ' AND (u.name LIKE ? OR p.phone LIKE ? OR p.id = ?)';
    params.push(`%${query.search}%`, `%${query.search}%`, query.search);
  }

  const [rows] = await pool.query(sql, params);
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    'SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ? AND p.is_active = TRUE',
    [id]
  );
  return rows[0] || null;
};

const create = async (data) => {
  const { email, password, name, age, blood_type, allergies, phone, address } = data;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new Error('EMAIL_EXISTS');

  const password_hash = await bcrypt.hash(password, 10);
  const [userResult] = await pool.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [email, password_hash, name, 'paciente']
  );

  const [patientResult] = await pool.query(
    'INSERT INTO patients (user_id, age, blood_type, allergies, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
    [userResult.insertId, age, blood_type, allergies, phone, address]
  );

  return { id: patientResult.insertId, user_id: userResult.insertId, name, email };
};

const update = async (id, data) => {
  const { age, blood_type, allergies, phone, address } = data;
  await pool.query(
    'UPDATE patients SET age = ?, blood_type = ?, allergies = ?, phone = ?, address = ? WHERE id = ?',
    [age, blood_type, allergies, phone, address, id]
  );
  return getById(id);
};

const deactivate = async (id) => {
  const [patient] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [id]);
  if (patient.length > 0) {
    await pool.query('UPDATE patients SET is_active = FALSE WHERE id = ?', [id]);
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [patient[0].user_id]);
  }
};

module.exports = { getAll, getById, create, update, deactivate };