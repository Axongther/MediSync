const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const result = await authService.register({ email, password, name, role });
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user.id); // ← fix: era getProfile
    if (!result) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

module.exports = { register, login, getMe };
