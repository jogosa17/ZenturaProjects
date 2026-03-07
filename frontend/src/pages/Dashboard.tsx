import React, { useState, useEffect } from 'react';
import { dashboardService, DashboardStats } from '../services/dashboard.service';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'iniciado': '#28a745',
      'aceptado': '#17a2b8',
      'finalizado': '#6c757d',
      'cobrado': '#28a745',
      'cancelado': '#dc3545',
      'pendiente': '#ffc107',
      'en curso': '#fd7e14',
      'finalizada': '#28a745'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error">
        <h2>Error cargando el dashboard</h2>
        <p>Por favor, recarga la página.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard Administrativo</h1>
        <button onClick={loadDashboardData} className="btn btn-outline-primary">
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card projects-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>Proyectos</h3>
            <div className="stat-numbers">
              <div className="stat-item">
                <span className="stat-number">{stats.projects.total_projects}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ color: getStatusColor('iniciado') }}>
                  {stats.projects.active_projects}
                </span>
                <span className="stat-label">Activos</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ color: getStatusColor('finalizado') }}>
                  {stats.projects.completed_projects}
                </span>
                <span className="stat-label">Completados</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card tasks-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Tareas</h3>
            <div className="stat-numbers">
              <div className="stat-item">
                <span className="stat-number">{stats.tasks.total_tasks}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ color: getStatusColor('en curso') }}>
                  {stats.tasks.active_tasks}
                </span>
                <span className="stat-label">En curso</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ color: getStatusColor('finalizada') }}>
                  {stats.tasks.completed_tasks}
                </span>
                <span className="stat-label">Completadas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card budget-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Presupuesto Total</h3>
            <div className="budget-amount">
              {formatCurrency(stats.tasks.total_budget)}
            </div>
          </div>
        </div>

        <div className="stat-card clients-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Clientes</h3>
            <div className="stat-number large">{stats.clients.total_clients}</div>
            <div className="stat-label">Clientes únicos</div>
          </div>
        </div>

        {stats.users && (
          <div className="stat-card users-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Usuarios</h3>
              <div className="stat-numbers">
                <div className="stat-item">
                  <span className="stat-number">{stats.users.total_users}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number" style={{ color: getStatusColor('iniciado') }}>
                    {stats.users.active_users}
                  </span>
                  <span className="stat-label">Activos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráficos y tablas */}
      <div className="dashboard-content">
        <div className="chart-section">
          <div className="chart-card">
            <h3>📈 Proyectos por Estado</h3>
            <div className="chart-content">
              {stats.projectsByStatus.map((item, index) => (
                <div key={index} className="status-bar">
                  <div className="status-info">
                    <span className="status-name">{item.status}</span>
                    <span className="status-count">{item.count}</span>
                  </div>
                  <div className="status-progress">
                    <div 
                      className="status-fill"
                      style={{ 
                        width: `${(item.count / stats.projects.total_projects) * 100}%`,
                        backgroundColor: getStatusColor(item.status)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>🎯 Tareas por Prioridad</h3>
            <div className="chart-content">
              {stats.tasksByPriority.map((item, index) => (
                <div key={index} className="priority-item">
                  <div className="priority-info">
                    <span className="priority-name">{item.priority}</span>
                    <span className="priority-count">{item.count}</span>
                  </div>
                  <div className="priority-bar">
                    <div 
                      className="priority-fill"
                      style={{ 
                        width: `${(item.count / stats.tasks.total_tasks) * 100}%`,
                        backgroundColor: getPriorityColor(item.priority)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-card">
            <h3>🕐 Actividad Reciente</h3>
            <div className="activity-list">
              {stats.recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-details">
                      <span className="activity-project">{activity.project_name}</span>
                      <span className="activity-user">{activity.user_name}</span>
                      <span className="activity-date">{formatDate(activity.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para obtener color de prioridad
function getPriorityColor(priority: string) {
  const colors = {
    'urgente': '#dc3545',
    'alta': '#fd7e14',
    'normal': '#0d6efd',
    'baja': '#198754'
  };
  return colors[priority as keyof typeof colors] || '#6c757d';
}

// Función auxiliar para obtener icono de actividad
function getActivityIcon(type: string) {
  const icons = {
    'task': '✅',
    'consulta': '💬',
    'file': '📁'
  };
  return icons[type as keyof typeof icons] || '📄';
}

export default Dashboard;
