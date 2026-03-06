import api from './api';

export interface FileData {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploader_name?: string;
  created_at: string;
}

export interface UploadFileDto {
  file: File;
  project_id?: number;
  task_id?: number;
  consulta_id?: number;
}

const FileService = {
  // Subir archivo
  uploadFile: async (data: UploadFileDto) => {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.project_id) formData.append('project_id', data.project_id.toString());
    if (data.task_id) formData.append('task_id', data.task_id.toString());
    if (data.consulta_id) formData.append('consulta_id', data.consulta_id.toString());

    const response = await api.post<{ success: boolean; message: string; data: FileData }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtener archivos
  getFiles: async (filters: { projectId?: number; taskId?: number; consultaId?: number }) => {
    const params = new URLSearchParams();
    if (filters.projectId) params.append('projectId', filters.projectId.toString());
    if (filters.taskId) params.append('taskId', filters.taskId.toString());
    if (filters.consultaId) params.append('consultaId', filters.consultaId.toString());

    const response = await api.get<{ success: boolean; data: FileData[] }>(`/files?${params.toString()}`);
    return response.data;
  },

  // Eliminar archivo
  deleteFile: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/files/${id}`);
    return response.data;
  }
};

export default FileService;
