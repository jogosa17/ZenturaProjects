import api from './api';

export interface Task {
  id: number;
  zone_id: number;
  project_id: number;
  name: string;
  description?: string;
  price: number;
  priority: number; // 0, 1, 2
  status: 'pending' | 'in_progress' | 'finished';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskDto {
  zone_id: number;
  name: string;
  description?: string;
  price?: number;
  priority?: number;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  price?: number;
  priority?: number;
  status?: 'pending' | 'in_progress' | 'finished';
  notes?: string;
}

const TaskService = {
  // Obtener tareas de una zona
  getTasksByZone: async (zoneId: number) => {
    const response = await api.get<{ success: boolean; data: Task[] }>(`/tasks/zone/${zoneId}`);
    return response.data;
  },

  // Crear tarea
  createTask: async (data: CreateTaskDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Task }>('/tasks', data);
    return response.data;
  },

  // Actualizar tarea
  updateTask: async (id: number, data: UpdateTaskDto) => {
    const response = await api.put<{ success: boolean; message: string; data: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  // Eliminar tarea
  deleteTask: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return response.data;
  }
};

export default TaskService;
