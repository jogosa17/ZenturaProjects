import React, { useState, useEffect } from 'react';
import { CreateClientDto, Client } from '../services/client.service';
import './ClientForm.css';

interface ClientFormProps {
  onSubmit: (data: CreateClientDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Client | null;
  loading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, initialData, loading = false }) => {
  const [formData, setFormData] = useState<CreateClientDto>({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="client-form-overlay">
      <div className="client-form-modal">
        <h3>{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del cliente o empresa"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: 600123456"
              required
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

export default ClientForm;
