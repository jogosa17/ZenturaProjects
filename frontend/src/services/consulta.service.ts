import api from './api';

export interface Reply {
  id: number;
  consulta_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  message: string;
  reply_to_id?: number;
  created_at: string;
}

export interface Consulta {
  id: number;
  project_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  message: string;
  created_at: string;
  updated_at: string;
  replies?: Reply[];
}

export interface CreateConsultaDto {
  project_id: number;
  message: string;
}

export interface ReplyConsultaDto {
  message: string;
  reply_to_id?: number;
}

const ConsultaService = {
  // Obtener consultas de un proyecto
  getConsultasByProject: async (projectId: number) => {
    const response = await api.get<{ success: boolean; data: Consulta[] }>(`/consultas/project/${projectId}`);
    return response.data;
  },

  // Crear consulta
  createConsulta: async (data: CreateConsultaDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Consulta }>('/consultas', data);
    return response.data;
  },

  // Responder consulta
  replyConsulta: async (consultaId: number, data: ReplyConsultaDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Reply }>(`/consultas/${consultaId}/reply`, data);
    return response.data;
  },

  // Eliminar consulta
  deleteConsulta: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/consultas/${id}`);
    return response.data;
  },

  // Eliminar respuesta
  deleteReply: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/consultas/reply/${id}`);
    return response.data;
  }
};

export default ConsultaService;
