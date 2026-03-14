import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import UserService, { User } from '../services/user.service';
import './UsersTable.css';

interface UsersTableProps {
  onEdit: (user: User) => void;
  refreshKey?: number;
}

const UsersTable: React.FC<UsersTableProps> = ({ onEdit, refreshKey = 0 }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando carga de usuarios...');
      const users = await UserService.getWorkers();
      console.log('✅ Usuarios cargados:', users);
      setUsers(users || []);
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err);
      console.error('   Mensaje:', err.message);
      console.error('   Respuesta:', err.response?.data);
      console.error('   Status:', err.response?.status);
      setError('Error al cargar usuarios: ' + (err.message || 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 1 ? 0 : 1;
      await UserService.toggleStatus(user.id, newStatus);
      
      // Actualizar estado localmente
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      console.error('Error al cambiar estado', err);
      alert('Error al cambiar el estado del usuario');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="projects-table-container">
      <table className="projects-table" style={{ minWidth: '700px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>DNI</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Proyectos</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center">No hay trabajadores registrados</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.dni || '-'}</td>
                <td><strong>{user.username || '-'}</strong></td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'priority-high' : 'priority-low'}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Trabajador'}
                  </span>
                </td>
                <td>
                  {user.projects ? (
                    <span style={{ color: '#6b7280' }} title={user.projects}>
                      {user.projects.length > 30 
                        ? user.projects.substring(0, 30) + '...' 
                        : user.projects}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>-</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${user.status === 1 ? 'status-finished' : 'status-cancelled'}`}>
                    {user.status === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{new Date(user.created_at || '').toLocaleDateString()}</td>
                <td>
                  <div className="actions-cell">
                    <button 
                      onClick={() => onEdit(user)}
                      className="btn-edit"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={user.status === 1 ? 'btn-view' : 'btn-delete'}
                      title={user.status === 1 ? "Desactivar usuario" : "Activar usuario"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
