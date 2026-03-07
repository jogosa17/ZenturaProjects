import api from './api';

export interface SearchResult {
  type: string;
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  price?: number;
  client_name?: string;
  project_name?: string;
  zone_name?: string;
  filename?: string;
  original_name?: string;
  file_size?: number;
  mime_type?: string;
  phone?: string;
  email?: string;
  role?: string;
  project_count?: number;
  task_count?: number;
  created_at?: string;
  start_date?: string;
  end_date?: string;
  url: string;
}

export interface QuickSearchResult {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

export interface SearchStats {
  entity: string;
  count: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export const searchService = {
  // Búsqueda global
  async search(query: string, type?: string, limit: number = 20): Promise<SearchResponse> {
    const params: any = { q: query, limit };
    if (type && type !== 'all') {
      params.type = type;
    }
    
    const response = await api.get('/search', { params });
    return response.data.data;
  },

  // Búsqueda rápida (autocomplete)
  async quickSearch(query: string, limit: number = 10): Promise<QuickSearchResult[]> {
    const response = await api.get('/search/quick', {
      params: { q: query, limit }
    });
    return response.data.data;
  },

  // Estadísticas de búsqueda
  async getSearchStats(): Promise<SearchStats[]> {
    const response = await api.get('/search/stats');
    return response.data.data;
  }
};
