import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      const routes = {
        paciente: '/paciente/citas',
        medico: '/medico/agenda',
        recepcionista: '/recepcionista/agenda',
        director: '/director/dashboard'
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <header className="header">
        <h1><span className="logo-medi">Medi</span><span className="logo-sync">Sync</span></h1>
        <p>Plataforma de Gestión Médica Digital</p>
      </header>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        {error && <div className="error-msg">{error}</div>}
        <label>Correo Electrónico</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;