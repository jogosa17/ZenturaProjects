import api from './api';
import { FileData } from './file.service';

export interface Note {
  id: number;
  task_id: number;
  user_id: number;
  user_name?: string;
  note: string;
  created_at: string;
  files?: FileData[];
}

export interface CreateNoteDto {
  task_id: number;
  note: string;
}

const NoteService = {
  // Obtener notas de una tarea
  getNotesByTask: async (taskId: number) => {
    const response = await api.get<{ success: boolean; data: Note[] }>(`/notes/task/${taskId}`);
    return response.data;
  },

  // Crear nota
  createNote: async (data: CreateNoteDto) => {
    const response = await api.post<{ success: boolean; message: string; data: Note }>('/notes', data);
    return response.data;
  },

  // Eliminar nota
  deleteNote: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/notes/${id}`);
    return response.data;
  }
};

export default NoteService;
