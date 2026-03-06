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
      } else {
        if (data.role === 'admin') {
          await UserService.createAdmin(data);
        } else {
          await UserService.createWorker(data);
        }
      }
      setShowForm(false);
      setRefreshKey(prev => prev + 1); // Forzar recarga de la tabla
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar el usuario');
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-create" onClick={handleCreateUser}>
          + Nuevo Usuario
        </button>
      </div>

      <UsersTable 
        key={refreshKey} 
        onEdit={handleEditUser} 
      />

      {showForm && (
        <UserForm
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default UsersPage;
