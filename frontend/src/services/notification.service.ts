import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  project_id?: number;
  project_name?: string;
  type: string;
  message: string;
  is_read: number | boolean;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
}

const NotificationService = {
  // Obtener notificaciones
  getNotifications: async (unreadOnly: boolean = false) => {
    const response = await api.get<NotificationResponse>(`/notifications?unreadOnly=${unreadOnly}`);
    return response.data;
  },

  // Marcar una como leída
  markAsRead: async (id: number) => {
    const response = await api.put<{ success: boolean; message: string }>(`/notifications/${id}/read`);
    return response.data;
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    const response = await api.put<{ success: boolean; message: string }>('/notifications/read-all');
    return response.data;
  }
};

export default NotificationService;
