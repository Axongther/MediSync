const API_URL = 'http://100.55.193.247/api';

const getToken = () => localStorage.getItem('token');

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` })
});

const request = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: headers(getToken()),
    ...options
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(error.error || 'Error desconocido');
  }
  return res.json();
};

const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: (token) => fetch(`${API_URL}/auth/me`, { headers: headers(token) }).then(r => r.json()),

  // Pacientes
  getPacientes: (search) => request(`/pacientes${search ? `?search=${search}` : ''}`),
  getPaciente: (id) => request(`/pacientes/${id}`),
  createPaciente: (data) => request('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
  updatePaciente: (id, data) => request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Médicos
  getMedicos: () => request('/medicos'),
  getMedico: (id) => request(`/medicos/${id}`),
  getSlotsDisponibles: (doctorId, fecha) => request(`/medicos/${doctorId}/slots-disponibles/${fecha}`),

  // Citas
  getCitas: () => request('/citas'),
  getCita: (id) => request(`/citas/${id}`),
  getCitasByMedico: (doctorId, params) => {
    const query = new URLSearchParams(params || {}).toString();
    return request(`/citas/medico/${doctorId}${query ? `?${query}` : ''}`);
  },
  getCitasByPaciente: (patientId) => request(`/citas/paciente/${patientId}`),
  getCitasByDia: (fecha, medicoId) => request(`/citas/dia/${fecha}${medicoId ? `?medico_id=${medicoId}` : ''}`),
  createCita: (data) => request('/citas', { method: 'POST', body: JSON.stringify(data) }),
  updateCita: (id, data) => request(`/citas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelarCita: (id, reason) => request(`/citas/${id}/cancelar`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  completarCita: (id) => request(`/citas/${id}/completar`, { method: 'PATCH' }),

  // Expedientes
  getExpediente: (patientId) => request(`/expedientes/paciente/${patientId}`),
  createExpediente: (data) => request('/expedientes', { method: 'POST', body: JSON.stringify(data) }),

  // Notificaciones
  getNotificaciones: (userId, filter) => request(`/notificaciones/${userId}${filter ? `?filter=${filter}` : ''}`),
  marcarLeida: (id) => request(`/notificaciones/${id}/leer`, { method: 'PUT' }),

  // Calificaciones
  calificarDoctor: (data) => request('/calificaciones', { method: 'POST', body: JSON.stringify(data) }),
  getCalificaciones: (doctorId) => request(`/calificaciones/medico/${doctorId}`),

  // Dashboard
  getDashboard: () => request('/dashboard/resumen'),
  getCitasPorMedico: () => request('/dashboard/citas-por-medico'),
  getIngresos: () => request('/dashboard/ingresos'),
  getCancelaciones: () => request('/dashboard/cancelaciones'),

  // Slots
  createSlot: (data) => request('/slots', { method: 'POST', body: JSON.stringify(data) }),
  updateSlot: (id, data) => request(`/slots/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSlot: (id) => request(`/slots/${id}`, { method: 'DELETE' }),

  // Usuarios
  getUsuarios: () => request('/usuarios'),
  changeRole: (id, role) => request(`/usuarios/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  toggleUsuario: (id) => request(`/usuarios/${id}/toggle`, { method: 'PATCH' })
};

export default api;