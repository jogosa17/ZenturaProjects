import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateUsername = (username: string): boolean => {
    // Validar formato: 1 letra + 4 números (ej: A1234)
    const regex = /^[A-Za-z]\d{4}$/;
    return regex.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar formato del usuario
    if (!validateUsername(formData.username)) {
      setError('El usuario debe tener 1 letra seguida de 4 números (ej: A1234)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<LoginResponse>('http://localhost:3001/api/auth/login', formData);
      
      if (response.data.success) {
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.data?.token || '');
        localStorage.setItem('user', JSON.stringify(response.data.data?.user || {}));
        
        // Redirigir al dashboard
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Zentura Projects</h1>
          <p>Iniciar sesión</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="A1234"
              maxLength={5}
              pattern="[A-Za-z]\d{4}"
              title="1 letra seguida de 4 números (ej: A1234)"
            />
            <small className="form-hint">Formato: 1 letra + 4 números (ej: W8429)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>2026 ZENTURA PROJECTS</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
