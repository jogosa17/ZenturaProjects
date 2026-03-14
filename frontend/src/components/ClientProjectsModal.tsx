import React from 'react';
import { Project } from '../services/project.service';
import ProjectsTable from './ProjectsTable';

interface ClientProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  projects: Project[];
  loading: boolean;
}

const ClientProjectsModal: React.FC<ClientProjectsModalProps> = ({ 
  isOpen, 
  onClose, 
  client, 
  projects, 
  loading 
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '1200px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header del modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            margin: '0',
            color: '#1E40AF',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Proyectos de {client?.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '0.75rem',
          padding: '1rem',
          minHeight: '400px'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#6b7280',
              fontSize: '1rem'
            }}>
              Cargando proyectos...
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#6b7280',
              fontSize: '1rem'
            }}>
              Este cliente no tiene proyectos asignados
            </div>
          ) : (
            <div>
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  margin: '0',
                  color: '#374151',
                  fontSize: '0.875rem'
                }}>
                  <strong>Cliente:</strong> {client?.name}<br />
                  <strong>Teléfono:</strong> {client?.phone}<br />
                  <strong>Total de proyectos:</strong> {projects.length}
                </p>
              </div>
              <ProjectsTable 
                projects={projects} 
                loading={false}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1E40AF',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1E40AF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectsModal;
