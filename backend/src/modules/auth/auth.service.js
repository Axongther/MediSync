const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

const register = async ({ email, password, name, role }) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new Error('EMAIL_EXISTS');

  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
    [email, password_hash, name, role]
  );
  const userId = result.insertId;

  if (role === 'paciente') {
    await pool.query('INSERT INTO patients (user_id) VALUES (?)', [userId]);
  }
  if (role === 'medico') {
    await pool.query('INSERT INTO doctors (user_id) VALUES (?)', [userId]);
  }

  const token = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { token, user: { id: userId, email, name, role } };
};

const login = async ({ email, password }) => {
  const [users] = await pool.query(
    'SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]
  );
  if (users.length === 0) throw new Error('INVALID_CREDENTIALS');

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error('INVALID_CREDENTIALS');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

const getMe = async (userId) => {
  const [users] = await pool.query(
    'SELECT id, email, name, role FROM users WHERE id = ? AND is_active = TRUE', [userId]
  );
  if (users.length === 0) return null;

  const user = users[0];
  let profile = { ...user };

  if (user.role === 'paciente') {
    const [patients] = await pool.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
    if (patients.length > 0) profile.patient = patients[0];
  }

  if (user.role === 'medico') {
    const [doctors] = await pool.query('SELECT * FROM doctors WHERE user_id = ?', [userId]);
    if (doctors.length > 0) profile.doctor = doctors[0];
  }

  return profile;
};

module.exports = { register, login, getMe };