import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas.');
        return data;
      })
      .then(data => {
        // Guardamos la pulserita VIP en el localStorage del navegador
        localStorage.setItem('adminToken', data.token);
        setLoading(false);
        navigate('/admin'); // Lo mandamos al centro de comando
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Cero Chamuyo</h1>
        <p>Acceso Restringido — Solo para la Navaja</p>
      </header>

      <div className="step-container">
        <h2>Centro de Comando</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ingresá tus credenciales, jefe. No te hagas el otario.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usuario">Usuario</label>
            <input
              type="text"
              id="usuario"
              required
              placeholder="Ej: admin"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ color: 'var(--error-color)', fontSize: '0.9rem', margin: '1rem 0' }}>
              ✖ {error}
            </div>
          )}

          <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Verificando...' : 'Entrar al Comando'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
