import api from './api';

export interface DashboardStats {
  projects: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    pending_projects: number;
  };
  tasks: {
    total_tasks: number;
    active_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    total_budget: number;
  };
  clients: {
    total_clients: number;
  };
  users: {
    total_users: number;
    active_users: number;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    status: string;
    date: string;
    project_name: string;
    user_name: string;
  }>;
  projectsByStatus: Array<{
    status: string;
    count: number;
  }>;
  tasksByPriority: Array<{
    priority: string;
    count: number;
  }>;
}

export interface RecentActivity {
  activity_type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  project_name: string;
  user_name: string;
}

export interface RecentNotification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  project_id?: number;
}

export const dashboardService = {
  // Obtener estadísticas principales
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  // Obtener actividad reciente
  async getRecentActivity(limit: number = 20, type: string = 'all'): Promise<RecentActivity[]> {
    const response = await api.get('/dashboard/activity', {
      params: { limit, type }
    });
    return response.data.data;
  },

  // Obtener notificaciones recientes
  async getRecentNotifications(limit: number = 10): Promise<RecentNotification[]> {
    const response = await api.get('/dashboard/notifications', {
      params: { limit }
    });
    return response.data.data;
  }
};
