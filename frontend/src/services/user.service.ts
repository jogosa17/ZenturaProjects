import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'worker';
  status: 0 | 1; // 0: inactive, 1: active
  created_at?: string;
  projects?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'worker';
  status?: 0 | 1;
}

const UserService = {
  // Obtener todos los trabajadores
  getWorkers: async () => {
    const response = await api.get<{ success: boolean; data: User[] }>('/users/workers');
    return response.data;
  },

  // Crear un nuevo trabajador
  createWorker: async (data: CreateUserDto) => {
    const response = await api.post<{ success: boolean; data: User }>('/users/workers', data);
    return response.data;
  },

  // Crear un nuevo administrador
  createAdmin: async (data: CreateUserDto) => {
    const response = await api.post<{ success: boolean; data: User }>('/users/admins', data);
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id: number, data: Partial<CreateUserDto>) => {
    const response = await api.put<{ success: boolean; message: string }>(`/users/${id}`, data);
    return response.data;
  },

  // Cambiar estado de usuario01
  toggleStatus: async (id: number, status: 'active' | 'inactive') => {
    const response = await api.patch<{ success: boolean; message: string }>(`/users/${id}/status`, { status });
    return response.data;
  }
};

export default UserService;
