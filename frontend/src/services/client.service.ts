import api from './api';

export interface Client {
  id: number;
  name: string;
  phone: string;
  created_at?: string;
  project_count?: number;
  projects?: any[]; // Podríamos definir una interfaz Project más adelante
}

export interface CreateClientDto {
  name: string;
  phone: string;
}

const ClientService = {
  // Obtener todos los clientes
  getClients: async () => {
    const response = await api.get<{ success: boolean; data: Client[] }>('/clients');
    return response.data;
  },

  // Obtener cliente por ID
  getClientById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Client }>(`/clients/${id}`);
    return response.data;
  },

  // Crear un nuevo cliente
  createClient: async (data: CreateClientDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Client }>('/clients', data);
    return response.data;
  },

  // Actualizar cliente
  updateClient: async (id: number, data: CreateClientDto) => {
    const response = await api.put<{ success: boolean; message: string; data: Client }>(`/clients/${id}`, data);
    return response.data;
  },

  // Eliminar cliente
  deleteClient: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/clients/${id}`);
    return response.data;
  }
};

export default ClientService;
