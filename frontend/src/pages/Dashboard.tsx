import React, { useState, useEffect } from 'react';
import { dashboardService, DashboardStats } from '../services/dashboard.service';
import Chat from '../components/Chat';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadUserData();
    
    // Escuchar cambios en localStorage (por si el usuario se loguea en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log('🔍 Dashboard: Cambio detectado en localStorage');
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También verificar periódicamente
    const interval = setInterval(() => {
      loadUserData();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    console.log('🔍 Cargando usuario desde localStorage:', userStr);
    
    if (userStr && userStr !== 'null' && userStr !== 'undefined') {
      try {
        const userData = JSON.parse(userStr);
        console.log('🔍 Usuario parseado:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Error parseando usuario:', error);
        setUser(null);
      }
    } else {
      console.log('🔍 No hay usuario en localStorage');
      setUser(null);
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
      console.log('📊 Estadísticas cargadas:', data);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
      </div>
      
      {/* Tarjeta de información del usuario - Solo visualización */}
      {user && (
        <div className="user-info-card">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="avatar-image" />
            ) : (
              <span className="avatar-icon">👤</span>
            )}
          </div>
          <div className="user-details">
            <h3 className="user-name">{user.username || user.name || 'Usuario'}</h3>
            <p className="user-email">{user.role === 'admin' ? 'Administrador' : user.role === 'worker' ? 'Trabajador' : 'Usuario'}</p>
          </div>
        </div>
      )}
      
      {/* Botón flotante de chat */}
      <button 
        className="chat-float-button"
        onClick={() => setShowChat(!showChat)}
        title="Chat Interno"
      >
        💬
      </button>
      
      {/* Modal de Chat */}
      {showChat && user && (
        <div className="chat-modal-overlay" onClick={() => setShowChat(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>💬 Chat Interno</h3>
              <button className="close-btn" onClick={() => setShowChat(false)}>✖️</button>
            </div>
            <div className="chat-modal-content">
              <Chat user={user} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
