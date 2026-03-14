import api from './api';

export interface Project {
  id: number;
  name: string;
  client_id: number;
  client_name?: string;
  location?: string;
  phone?: string;
  contact_person?: string;
  contact_phone?: string;
  comments?: string;
  priority: 'urgent' | 'high' | 'low';
  status: 'started' | 'cancelled' | 'accepted' | 'finished' | 'paid';
  start_date?: string;
  end_date?: string;
  is_urgent: number | boolean; // MySQL returns 0/1, we might treat as boolean
  created_at?: string;
  workers?: any[];
  total_budget?: number;
  budget_file?: {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
  };
  invoice_file?: {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
  };
}

export interface CreateProjectDto {
  name: string;
  client_id: number;
  location?: string;
  phone?: string;
  contact_person?: string;
  contact_phone?: string;
  comments?: string;
  priority?: 'urgent' | 'high' | 'low';
  status?: 'started' | 'cancelled' | 'accepted' | 'finished' | 'paid';
  start_date?: string;
  end_date?: string;
  is_urgent?: boolean;
}

const ProjectService = {
  // Obtener todos los proyectos
  getProjects: async () => {
    const response = await api.get<{ success: boolean; data: Project[] }>('/projects');
    return response.data;
  },

  // Obtener proyectos por cliente
  getProjectsByClient: async (clientId: number) => {
    const response = await api.get<{ success: boolean; data: Project[] }>(`/projects?client_id=${clientId}`);
    return response.data;
  },

  // Obtener proyecto por ID
  getProjectById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return response.data;
  },

  // Crear proyecto
  createProject: async (data: CreateProjectDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Project }>('/projects', data);
    return response.data;
  },

  // Actualizar proyecto
  updateProject: async (id: number, data: CreateProjectDto) => {
    const response = await api.put<{ success: boolean; message: string }>(`/projects/${id}`, data);
    return response.data;
  },

  // Eliminar proyecto
  deleteProject: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/projects/${id}`);
    return response.data;
  },

  // Asignar trabajador
  assignWorker: async (projectId: number, workerId: number) => {
    const response = await api.post<{ success: boolean; message: string }>(`/projects/${projectId}/workers`, { worker_id: workerId });
    return response.data;
  },

  // Remover trabajador
  removeWorker: async (projectId: number, workerId: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/projects/${projectId}/workers/${workerId}`);
    return response.data;
  },

  // Subir presupuesto
  uploadBudget: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ success: boolean; message: string; data: any }>(`/projects/${projectId}/budget`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Subir factura
  uploadInvoice: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ success: boolean; message: string; data: any }>(`/projects/${projectId}/invoice`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default ProjectService;
