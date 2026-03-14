import React, { useState } from 'react';
import UsersTable from '../components/UsersTable';
import UserForm from '../components/UserForm';
import UserService, { CreateUserDto, User } from '../services/user.service';
import './UsersPage.css';

const UsersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateUserDto) => {
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser.id, data);
        // Solo cerrar el formulario inmediatamente al editar
        setShowForm(false);
        setRefreshKey(prev => prev + 1);
      } else {
        if (data.role === 'admin') {
          await UserService.createAdmin(data);
        } else {
          await UserService.createWorker(data);
        }
        // Al crear nuevo usuario, NO cerrar el formulario aquí
        // El formulario se cerrará desde el modal de credenciales
        setRefreshKey(prev => prev + 1); // Forzar recarga de la tabla
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      // Re-lanzar el error para que UserForm lo maneje
      throw error;
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-create" onClick={handleCreateUser}>
          + Nuevo Usuario
        </button>
      </div>

      <UsersTable 
        onEdit={handleEditUser}
        refreshKey={refreshKey}
      />

      {showForm && (
        <UserForm
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default UsersPage;
