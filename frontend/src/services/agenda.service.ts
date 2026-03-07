import api from './api';

export interface AgendaItem {
  id: number;
  title: string;
  client: string;
  workers: string[];
  start: string;
  end: string;
  status: string;
  priority: string;
  type: string;
}

export interface AgendaEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    client: string;
    workers: string[];
    status: string;
    priority: string;
  };
}

export interface UpcomingProject {
  id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  client_name: string;
  days_until_start: number;
}

export const agendaService = {
  // Obtener agenda completa
  async getAgenda(): Promise<AgendaItem[]> {
    const response = await api.get('/agenda');
    return response.data.data;
  },

  // Obtener eventos por rango de fechas
  async getAgendaByDateRange(start: string, end: string): Promise<AgendaEvent[]> {
    const response = await api.get('/agenda/range', {
      params: { start, end }
    });
    return response.data.data;
  },

  // Obtener proyectos próximos
  async getUpcomingProjects(): Promise<UpcomingProject[]> {
    const response = await api.get('/agenda/upcoming');
    return response.data.data;
  }
};
