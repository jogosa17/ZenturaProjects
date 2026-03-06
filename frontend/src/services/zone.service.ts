import api from './api';

export interface Zone {
  id: number;
  project_id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateZoneDto {
  project_id: number;
  name: string;
}

export interface UpdateZoneDto {
  name: string;
}

const ZoneService = {
  // Obtener zonas de un proyecto
  getZonesByProject: async (projectId: number) => {
    const response = await api.get<{ success: boolean; data: Zone[] }>(`/zones/project/${projectId}`);
    return response.data;
  },

  // Crear zona
  createZone: async (data: CreateZoneDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Zone }>('/zones', data);
    return response.data;
  },

  // Actualizar zona
  updateZone: async (id: number, data: UpdateZoneDto) => {
    const response = await api.put<{ success: boolean; message: string; data: { id: number; name: string } }>(`/zones/${id}`, data);
    return response.data;
  },

  // Eliminar zona
  deleteZone: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/zones/${id}`);
    return response.data;
  }
};

export default ZoneService;
