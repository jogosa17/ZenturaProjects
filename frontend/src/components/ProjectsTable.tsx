import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../services/project.service';
import './ProjectsTable.css';

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ 
  projects, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading-container">Cargando proyectos...</div>;
  }

  const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
      urgent: 'Urgente',
      high: 'Alta',
      low: 'Baja'
    };
    return map[priority] || priority;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      started: 'Iniciado',
      cancelled: 'Cancelado',
      accepted: 'Aceptado',
      finished: 'Finalizado',
      paid: 'Pagado'
    };
    return map[status] || status;
  };

  return (
    <div className="projects-table-container">
      <table className="projects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Proyecto</th>
            <th>Cliente</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Fechas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center">No hay proyectos registrados</td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>
                  <div 
                    className="project-name-cell clickable" 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    title="Ver detalles del proyecto"
                  >
                    <span className="project-name">{project.name}</span>
                    {Boolean(project.is_urgent) && <span className="urgent-badge">🔥 Urgente</span>}
                  </div>
                </td>
                <td>{project.client_name || '-'}</td>
                <td>{project.location || '-'}</td>
                <td>
                  <span className={`badge status-${project.status}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </td>
                <td>
                  <span className={`badge priority-${project.priority}`}>
                    {getPriorityLabel(project.priority)}
                  </span>
                </td>
                <td>
                  <div className="dates-cell">
                    <small>Inicio: {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</small>
                    <small>Fin: {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</small>
                  </div>
                </td>
                <td className="actions-cell">
                  <button 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="btn-view"
                  >
                    Ver
                  </button>
                  <button 
                    onClick={() => onEdit(project)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => onDelete(project)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
