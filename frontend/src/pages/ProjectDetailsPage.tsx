import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectService, { Project } from '../services/project.service';
import ZonesManager from '../components/ZonesManager';
import FilesManager from '../components/FilesManager';
import ChatManager from '../components/ChatManager';
import WorkerAssignment from '../components/WorkerAssignment';
import './ProjectDetailsPage.css';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState<'budget' | 'invoice' | null>(null);
  const [user, setUser] = useState<any>(null);
  const budgetInputRef = React.useRef<HTMLInputElement>(null);
  const invoiceInputRef = React.useRef<HTMLInputElement>(null);
  const API_URL = 'http://localhost:3001';

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      const result = await ProjectService.getProjectById(Number(id));
      if (result.success) {
        setProject(result.data);
      } else {
        setError('No se pudo cargar la información del proyecto');
      }
    } catch (err) {
      console.error('Error al cargar proyecto:', err);
      setError('Error al cargar los detalles del proyecto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // Cargar usuario desde localStorage
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'null' && userStr !== 'undefined') {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parseando usuario:', error);
      }
    }
  }, [id]);

  const handleFileUpload = async (type: 'budget' | 'invoice', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !project) return;
    
    const file = e.target.files[0];
    setUploadingDoc(type);
    
    try {
      if (type === 'budget') {
        await ProjectService.uploadBudget(project.id, file);
      } else {
        await ProjectService.uploadInvoice(project.id, file);
      }
      fetchProject();
    } catch (err) {
      console.error(`Error al subir ${type}:`, err);
      alert(`Error al subir ${type === 'budget' ? 'el presupuesto' : 'la factura'}`);
    } finally {
      setUploadingDoc(null);
      if (e.target) e.target.value = '';
    }
  };

  if (loading) return <div className="loading-container">Cargando proyecto...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div className="error-message">Proyecto no encontrado</div>;

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
    <div className="project-details-page">
      <div className="page-header">
        <div className="header-title">
          <button className="btn-back" onClick={() => navigate('/projects')}>
            ← Volver
          </button>
          <h1>{project.name}</h1>
          {Boolean(project.is_urgent) && <span className="urgent-badge">🔥 Urgente</span>}
        </div>
        <div className="header-actions">
          <div className="doc-actions">
            {/* Presupuesto */}
            <div className="doc-action-item">
              <input 
                type="file" 
                ref={budgetInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => handleFileUpload('budget', e)} 
              />
              {project.budget_file ? (
                <div className="doc-controls">
                  <a 
                    href={`${API_URL}${project.budget_file.file_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-doc view"
                    title="Ver Presupuesto"
                  >
                    📄 Ver Presupuesto
                  </a>
                  <button 
                    onClick={() => budgetInputRef.current?.click()} 
                    className="btn-doc upload" 
                    disabled={uploadingDoc === 'budget'}
                    title="Actualizar Presupuesto"
                  >
                    🔄
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => budgetInputRef.current?.click()} 
                  className="btn-doc upload-new"
                  disabled={uploadingDoc === 'budget'}
                >
                  {uploadingDoc === 'budget' ? 'Subiendo...' : '📤 Subir Presupuesto'}
                </button>
              )}
            </div>

            {/* Factura */}
            <div className="doc-action-item">
              <input 
                type="file" 
                ref={invoiceInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => handleFileUpload('invoice', e)} 
              />
              {project.invoice_file ? (
                <div className="doc-controls">
                  <a 
                    href={`${API_URL}${project.invoice_file.file_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-doc view invoice"
                    title="Ver Factura"
                  >
                    💰 Ver Factura
                  </a>
                  <button 
                    onClick={() => invoiceInputRef.current?.click()} 
                    className="btn-doc upload" 
                    disabled={uploadingDoc === 'invoice'}
                    title="Actualizar Factura"
                  >
                    🔄
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => invoiceInputRef.current?.click()} 
                  className="btn-doc upload-new invoice"
                  disabled={uploadingDoc === 'invoice'}
                >
                  {uploadingDoc === 'invoice' ? 'Subiendo...' : '📤 Subir Factura'}
                </button>
              )}
            </div>
          </div>

          <div className="budget-display">
            <span className="budget-label">Presupuesto Total:</span>
            <span className="budget-value">{project.total_budget ? `${project.total_budget.toFixed(2)} €` : '0.00 €'}</span>
          </div>
          <span className={`badge status-${project.status}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>
      </div>

      <div className="project-grid">
        {/* Columna Izquierda - Información Principal */}
        <div className="project-info-column">
          <div className="info-card">
            <h3>Información General</h3>
            <div className="info-row">
              <strong>Cliente:</strong>
              <span>{project.client_name || '-'}</span>
            </div>
            <div className="info-row">
              <strong>Ubicación:</strong>
              <span>{project.location || '-'}</span>
            </div>
            <div className="info-row">
              <strong>Prioridad:</strong>
              <span className={`priority-text priority-${project.priority}`}>
                {getPriorityLabel(project.priority)}
              </span>
            </div>
            <div className="info-row">
              <strong>Fecha Inicio:</strong>
              <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</span>
            </div>
            <div className="info-row">
              <strong>Fecha Fin:</strong>
              <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</span>
            </div>
          </div>

          <div className="info-card">
            <h3>Contacto</h3>
            <div className="info-row">
              <strong>Persona:</strong>
              <span>{project.contact_person || '-'}</span>
            </div>
            <div className="info-row">
              <strong>Teléfono:</strong>
              <span>
                {project.contact_phone ? (
                  <a href={`tel:${project.contact_phone}`} className="phone-link">
                    📞 {project.contact_phone}
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>

          {project.comments && (
            <div className="info-card">
              <h3>Comentarios</h3>
              <p className="comments-text">{project.comments}</p>
            </div>
          )}
        </div>

        {/* Columna Derecha - Trabajadores y Estadísticas */}
        <div className="project-sidebar-column">
          {/* Componente de asignación de trabajadores - solo para admins */}
          <WorkerAssignment 
            projectId={project.id} 
            projectName={project.name} 
            userRole={user?.role}
            onAssignmentChange={fetchProject}
          />

          <div className="info-card">
            <FilesManager projectId={project.id} title="Archivos del Proyecto" />
          </div>

          <div className="info-card">
            <ChatManager projectId={project.id} />
          </div>

          <div className="info-card">
            <ZonesManager projectId={project.id} onTasksChange={fetchProject} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
