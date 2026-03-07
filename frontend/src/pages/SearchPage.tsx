import React, { useState, useEffect } from 'react';
import { searchService, SearchResult, QuickSearchResult, SearchStats } from '../services/search.service';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [stats, setStats] = useState<SearchStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuickResults, setShowQuickResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadSearchStats();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      performQuickSearch();
    } else {
      setQuickResults([]);
      setShowQuickResults(false);
    }
  }, [query]);

  const loadSearchStats = async () => {
    try {
      const searchStats = await searchService.getSearchStats();
      setStats(searchStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const performQuickSearch = async () => {
    try {
      const quick = await searchService.quickSearch(query);
      setQuickResults(quick);
      setShowQuickResults(quick.length > 0);
    } catch (error) {
      console.error('Error en búsqueda rápida:', error);
    }
  };

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    
    try {
      setLoading(true);
      setShowQuickResults(false);
      const searchResults = await searchService.search(query, searchType);
      setResults(searchResults.results);
      setTotalResults(searchResults.total);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickResultClick = (result: QuickSearchResult) => {
    setQuery(result.title);
    setShowQuickResults(false);
    // Abrir URL en nueva pestaña
    window.open(result.url, '_blank');
  };

  const handleResultClick = (result: SearchResult) => {
    window.open(result.url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'project': '📁',
      'task': '✅',
      'client': '🏢',
      'zone': '📍',
      'file': '📄',
      'user': '👤'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'iniciado': '#28a745',
      'aceptado': '#17a2b8',
      'finalizado': '#6c757d',
      'cobrado': '#28a745',
      'cancelado': '#dc3545',
      'pendiente': '#ffc107',
      'en curso': '#fd7e14',
      'finalizada': '#28a745',
      'active': '#28a745',
      'inactive': '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'urgente': '#dc3545',
      'alta': '#fd7e14',
      'normal': '#0d6efd',
      'baja': '#198754'
    };
    return colors[priority as keyof typeof colors] || '#6c757d';
  };

  const renderResultItem = (result: SearchResult) => {
    switch (result.type) {
      case 'project':
        return (
          <div className="result-item project-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.title}</h3>
              {result.status && (
                <span className="status-badge" style={{ backgroundColor: getStatusColor(result.status) }}>
                  {result.status}
                </span>
              )}
            </div>
            {result.description && <p className="result-description">{result.description}</p>}
            <div className="result-details">
              {result.client_name && <span><strong>Cliente:</strong> {result.client_name}</span>}
              {result.start_date && <span><strong>Inicio:</strong> {formatDate(result.start_date)}</span>}
              {result.end_date && <span><strong>Fin:</strong> {formatDate(result.end_date)}</span>}
            </div>
          </div>
        );

      case 'task':
        return (
          <div className="result-item task-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.title}</h3>
              {result.status && (
                <span className="status-badge" style={{ backgroundColor: getStatusColor(result.status) }}>
                  {result.status}
                </span>
              )}
              {result.priority && (
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(result.priority) }}>
                  {result.priority}
                </span>
              )}
            </div>
            {result.description && <p className="result-description">{result.description}</p>}
            <div className="result-details">
              {result.project_name && <span><strong>Proyecto:</strong> {result.project_name}</span>}
              {result.zone_name && <span><strong>Zona:</strong> {result.zone_name}</span>}
              {result.price && <span><strong>Precio:</strong> {formatCurrency(result.price)}</span>}
            </div>
          </div>
        );

      case 'client':
        return (
          <div className="result-item client-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.title}</h3>
            </div>
            <div className="result-details">
              {result.phone && <span><strong>Teléfono:</strong> {result.phone}</span>}
              {result.project_count && <span><strong>Proyectos:</strong> {result.project_count}</span>}
            </div>
          </div>
        );

      case 'zone':
        return (
          <div className="result-item zone-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.title}</h3>
            </div>
            <div className="result-details">
              {result.project_name && <span><strong>Proyecto:</strong> {result.project_name}</span>}
              {result.task_count && <span><strong>Tareas:</strong> {result.task_count}</span>}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="result-item file-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.original_name || result.title}</h3>
            </div>
            <div className="result-details">
              {result.project_name && <span><strong>Proyecto:</strong> {result.project_name}</span>}
              {result.file_size && <span><strong>Tamaño:</strong> {formatFileSize(result.file_size)}</span>}
              {result.created_at && <span><strong>Subido:</strong> {formatDate(result.created_at)}</span>}
            </div>
          </div>
        );

      case 'user':
        return (
          <div className="result-item user-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.title}</h3>
              {result.status && (
                <span className="status-badge" style={{ backgroundColor: getStatusColor(result.status) }}>
                  {result.status}
                </span>
              )}
            </div>
            <div className="result-details">
              {result.email && <span><strong>Email:</strong> {result.email}</span>}
              {result.role && <span><strong>Rol:</strong> {result.role}</span>}
              {result.project_count && <span><strong>Proyectos:</strong> {result.project_count}</span>}
            </div>
          </div>
        );

      default:
        return (
          <div className="result-item">
            <div className="result-header">
              <span className="result-icon">{getTypeIcon(result.type)}</span>
              <h3>{result.title}</h3>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>🔍 Buscador Global</h1>
        <div className="search-stats">
          {stats.map(stat => (
            <div key={stat.entity} className="stat-item">
              <span className="stat-number">{stat.count}</span>
              <span className="stat-label">{stat.entity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="search-controls">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar proyectos, tareas, clientes, archivos..."
            className="search-input"
            autoFocus
          />
          <button onClick={handleSearch} disabled={loading} className="search-button">
            {loading ? '🔄' : '🔍'}
          </button>
        </div>

        <div className="search-filters">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="search-filter">
            <option value="all">Todos</option>
            <option value="projects">Proyectos</option>
            <option value="tasks">Tareas</option>
            <option value="clients">Clientes</option>
            <option value="zones">Zonas</option>
            <option value="files">Archivos</option>
            <option value="users">Usuarios</option>
          </select>
        </div>
      </div>

      {/* Resultados rápidos */}
      {showQuickResults && quickResults.length > 0 && (
        <div className="quick-results">
          <h3>Resultados rápidos</h3>
          <div className="quick-results-list">
            {quickResults.map(result => (
              <div
                key={`${result.type}-${result.id}`}
                className="quick-result-item"
                onClick={() => handleQuickResultClick(result)}
              >
                <span className="quick-result-icon">{getTypeIcon(result.type)}</span>
                <div className="quick-result-content">
                  <div className="quick-result-title">{result.title}</div>
                  <div className="quick-result-subtitle">{result.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {results.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h2>Resultados de búsqueda</h2>
            <span className="results-count">{totalResults} resultados</span>
          </div>
          <div className="results-list">
            {results.map(result => (
              <div
                key={`${result.type}-${result.id}`}
                className="result-item-container"
                onClick={() => handleResultClick(result)}
              >
                {renderResultItem(result)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {query.length >= 2 && results.length === 0 && !loading && !showQuickResults && (
        <div className="no-results">
          <h2>📭 No se encontraron resultados</h2>
          <p>Intenta con diferentes términos de búsqueda</p>
        </div>
      )}

      {/* Estado inicial */}
      {query.length < 2 && (
        <div className="search-tips">
          <h2>💡 Consejos de búsqueda</h2>
          <ul>
            <li>Usa al menos 2 caracteres para buscar</li>
            <li>Puedes buscar por nombre de proyecto, tarea o cliente</li>
            <li>Usa los filtros para limitar la búsqueda a un tipo específico</li>
            <li>Los resultados se ordenan por relevancia</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
