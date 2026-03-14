import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NotificationBell } from '../Notifications';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'worker'] },
    { path: '/users', label: 'Usuarios', icon: '👥', roles: ['admin'] },
    { path: '/clients', label: 'Clientes', icon: '🏢', roles: ['admin', 'worker'] },
    { path: '/projects', label: 'Proyectos', icon: '📁', roles: ['admin', 'worker'] },
    { path: '/agenda', label: 'Agenda', icon: '📅', roles: ['admin', 'worker'] },
    { path: '/search', label: 'Buscar', icon: '🔍', roles: ['admin', 'worker'] },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Zentura Projects</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              if (user && !item.roles.includes(user.role)) return null;
              
              return (
                <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                  <Link to={item.path}>
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Trabajador'}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px', backgroundColor: 'white', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;

