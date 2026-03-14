import api from './api';

const API_URL = 'http://localhost:3001';

export interface Note {
  id: number;
  task_id: number;
  user_id: number;
  user_name?: string;
  note: string;
  created_at: string;
  files?: any[]; // Cambiado a any para evitar error
}

export interface CreateNoteDto {
  task_id: number;
  note: string;
}

const NoteService = {
  // Obtener notas de una tarea
  getNotesByTask: async (taskId: number) => {
    const response = await api.get<{ success: boolean; data: Note[] }>(`${API_URL}/api/notes/task/${taskId}`);
    return response.data;
  },

  // Crear nota
  createNote: async (data: CreateNoteDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Note }>(`${API_URL}/api/notes`, data);
    return response.data;
  },

  // Eliminar nota
  deleteNote: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`${API_URL}/api/notes/${id}`);
    return response.data;
  }
};

export default NoteService;
