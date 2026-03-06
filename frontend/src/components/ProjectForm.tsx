import React, { useState, useEffect } from 'react';
import { CreateProjectDto, Project } from '../services/project.service';
import { Client } from '../services/client.service';
import ClientService from '../services/client.service';
import './ProjectForm.css';

interface ProjectFormProps {
  onSubmit: (data: CreateProjectDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Project | null;
  loading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, initialData, loading = false }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    client_id: 0,
    location: '',
    phone: '',
    contact_person: '',
    contact_phone: '',
    comments: '',
    priority: 'low',
    status: 'started',
    start_date: '',
    end_date: '',
    is_urgent: false
  });

  useEffect(() => {
    const loadClients = async () => {
      try {
        const result = await ClientService.getClients();
        if (result.success) {
          setClients(result.data);
        }
      } catch (err) {
        console.error('Error al cargar clientes para el formulario:', err);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        client_id: initialData.client_id,
        location: initialData.location || '',
        phone: initialData.phone || '',
        contact_person: initialData.contact_person || '',
        contact_phone: initialData.contact_phone || '',
        comments: initialData.comments || '',
        priority: initialData.priority,
        status: initialData.status,
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        is_urgent: Boolean(initialData.is_urgent)
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'client_id') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="project-form-overlay">
      <div className="project-form-modal">
        <h3>{initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Columna Izquierda */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="name">Nombre del Proyecto *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="client_id">Cliente *</label>
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                >
                  <option value={0}>Seleccionar cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridad</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Baja</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="started">Iniciado</option>
                  <option value="accepted">Aceptado</option>
                  <option value="finished">Finalizado</option>
                  <option value="paid">Pagado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="start_date">Fecha de Inicio</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">Fecha de Fin</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_person">Persona de Contacto</label>
                <input
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_phone">Teléfono de Contacto</label>
                <input
                  type="text"
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_urgent"
                    checked={Boolean(formData.is_urgent)}
                    onChange={handleChange}
                  />
                  Marcar como Urgente
                </label>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="comments">Comentarios</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
