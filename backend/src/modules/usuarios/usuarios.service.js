const pool = require('../../config/db');

const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
};

const changeRole = async (id, newRole) => {
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [newRole, id]);
  return { id, message: `Rol cambiado a ${newRole}` };
};

const toggle = async (id) => {
  const [user] = await pool.query('SELECT is_active FROM users WHERE id = ?', [id]);
  if (user.length === 0) throw new Error('USER_NOT_FOUND');

  const newStatus = !user[0].is_active;
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

  // Si tiene perfil de paciente o doctor, también cambiar su estado
  await pool.query('UPDATE patients SET is_active = ? WHERE user_id = ?', [newStatus, id]);
  await pool.query('UPDATE doctors SET is_active = ? WHERE user_id = ?', [newStatus, id]);

  return { id, is_active: newStatus, message: newStatus ? 'Usuario activado' : 'Usuario desactivado' };
};

module.exports = { getAll, changeRole, toggle };