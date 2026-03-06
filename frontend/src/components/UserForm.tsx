import React, { useState, useEffect } from 'react';
import { CreateUserDto, User } from '../services/user.service';
import './UserForm.css';

interface UserFormProps {
  onSubmit: (data: CreateUserDto) => Promise<void>;
  onCancel: () => void;
  initialData?: User | null;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, initialData, loading = false }) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    password: '',
    role: 'worker'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: '', // No mostramos la contraseña al editar
        role: initialData.role
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <div className="user-form-overlay">
      <div className="user-form-modal">
        <h3>{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {initialData ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={!!initialData} // No permitimos cambiar el rol al editar por ahora
            >
              <option value="worker">Trabajador</option>
              <option value="admin">Administrador</option>
            </select>
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

export default UserForm;
