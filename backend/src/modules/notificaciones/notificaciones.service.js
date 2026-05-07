const pool = require('../../config/db');

const getByUser = async (userId, filter) => {
  let sql = 'SELECT * FROM notifications WHERE user_id = ?';
  if (filter === 'leidas') sql += ' AND is_read = TRUE';
  if (filter === 'no_leidas') sql += ' AND is_read = FALSE';
  sql += ' ORDER BY created_at DESC';
  const [rows] = await pool.query(sql, [userId]);

  const [counts] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) AS no_leidas,
       SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) AS leidas
     FROM notifications WHERE user_id = ?`, [userId]
  );

  return { notifications: rows, counts: counts[0] };
};

const markAsRead = async (id) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
  return { message: 'Notificación marcada como leída' };
};

module.exports = { getByUser, markAsRead };