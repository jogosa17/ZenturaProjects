import React, { useState, useEffect } from 'react';
import { agendaService, AgendaItem, AgendaEvent, UpcomingProject } from '../services/agenda.service';
import './AgendaPage.css';

const AgendaPage: React.FC = () => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [upcomingProjects, setUpcomingProjects] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadAgendaData();
  }, []);

  const loadAgendaData = async () => {
    try {
      setLoading(true);
      const [agenda, upcoming] = await Promise.all([
        agendaService.getAgenda(),
        agendaService.getUpcomingProjects()
      ]);
      
      setAgendaItems(agenda);
      setUpcomingProjects(upcoming);
    } catch (error) {
      console.error('Error cargando agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'iniciado': '#28a745',
      'aceptado': '#17a2b8',
      'finalizado': '#6c757d',
      'cobrado': '#28a745',
      'cancelado': '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'urgente': 'danger',
      'alta': 'warning',
      'normal': 'primary',
      'baja': 'success'
    };
    return badges[priority as keyof typeof badges] || 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openProject = (projectId: number) => {
    window.open(`/projects/${projectId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="agenda-loading">
        <div className="spinner"></div>
        <p>Cargando agenda...</p>
      </div>
    );
  }

  return (
    <div className="agenda-page">
      <div className="agenda-header">
        <h1>📅 Agenda</h1>
        <div className="view-toggle">
          <button 
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setView('list')}
          >
            📋 Lista
          </button>
          <button 
            className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setView('calendar')}
          >
            📆 Calendario
          </button>
        </div>
      </div>

      {/* Próximos proyectos */}
      {upcomingProjects.length > 0 && (
        <div className="upcoming-section">
          <h2>🚀 Próximos Proyectos (30 días)</h2>
          <div className="upcoming-grid">
            {upcomingProjects.map(project => (
              <div key={project.id} className="upcoming-card">
                <div className="upcoming-header">
                  <h3>{project.project_name}</h3>
                  <span className={`badge badge-${getPriorityBadge(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
                <div className="upcoming-client">
                  <strong>Cliente:</strong> {project.client_name}
                </div>
                <div className="upcoming-dates">
                  <div>
                    <strong>Inicio:</strong> {formatDate(project.start_date)}
                  </div>
                  <div>
                    <strong>Fin:</strong> {formatDate(project.end_date)}
                  </div>
                </div>
                <div className="upcoming-countdown">
                  <strong>Comienza en:</strong> {project.days_until_start} días
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => openProject(project.id)}
                >
                  Ver Proyecto
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de agenda */}
      {view === 'list' && (
        <div className="agenda-list-section">
          <h2>📋 Todos los Proyectos</h2>
          <div className="agenda-list">
            {agendaItems.map(item => (
              <div key={item.id} className="agenda-item">
                <div className="agenda-item-header">
                  <h3>{item.title}</h3>
                  <div className="agenda-item-badges">
                    <span className={`badge badge-${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span 
                      className="badge"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                
                <div className="agenda-item-details">
                  <div className="agenda-item-client">
                    <strong>Cliente:</strong> {item.client}
                  </div>
                  
                  <div className="agenda-item-dates">
                    <div>
                      <strong>Inicio:</strong> {formatDate(item.start)}
                    </div>
                    <div>
                      <strong>Fin:</strong> {item.end ? formatDate(item.end) : 'No definida'}
                    </div>
                  </div>
                  
                  {item.workers.length > 0 && (
                    <div className="agenda-item-workers">
                      <strong>Trabajadores:</strong>
                      <div className="workers-list">
                        {item.workers.map((worker, index) => (
                          <span key={index} className="worker-tag">
                            {worker}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="agenda-item-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => openProject(item.id)}
                  >
                    Abrir Proyecto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista de calendario (placeholder) */}
      {view === 'calendar' && (
        <div className="calendar-placeholder">
          <div className="calendar-info">
            <h2>📆 Vista de Calendario</h2>
            <p>La vista de calendario estará disponible próximamente.</p>
            <p>Mientras tanto, puedes usar la vista de lista para ver todos tus proyectos.</p>
          </div>
        </div>
      )}

      {agendaItems.length === 0 && upcomingProjects.length === 0 && (
        <div className="empty-agenda">
          <h2>📭 No hay proyectos en la agenda</h2>
          <p>No tienes proyectos asignados o próximos en los próximos 30 días.</p>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;
