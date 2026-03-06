import React, { useState, useEffect, useRef } from 'react';
import FileService, { FileData } from '../services/file.service';
import './FilesManager.css';

interface FilesManagerProps {
  projectId?: number;
  taskId?: number;
  consultaId?: number;
  title?: string;
}

const FilesManager: React.FC<FilesManagerProps> = ({ projectId, taskId, consultaId, title = 'Archivos' }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Base URL para archivos (ajustar según tu configuración)
  const API_URL = 'http://localhost:3001';

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const result = await FileService.getFiles({ projectId, taskId, consultaId });
      if (result.success) {
        setFiles(result.data);
      }
    } catch (err) {
      console.error('Error al cargar archivos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId || taskId || consultaId) {
      fetchFiles();
    }
  }, [projectId, taskId, consultaId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await FileService.uploadFile({
        file,
        project_id: projectId,
        task_id: taskId,
        consulta_id: consultaId
      });
      fetchFiles();
    } catch (err) {
      console.error('Error al subir archivo:', err);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      try {
        await FileService.deleteFile(id);
        fetchFiles();
      } catch (err) {
        console.error('Error al eliminar archivo:', err);
        alert('Error al eliminar el archivo');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    return '📁';
  };

  return (
    <div className="files-manager">
      <div className="files-header">
        <h3>{title}</h3>
        <button 
          className="btn-upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileSelect} 
        />
      </div>

      <div className="files-list">
        {loading ? (
          <p className="loading-text">Cargando archivos...</p>
        ) : files.length === 0 ? (
          <p className="no-files">No hay archivos adjuntos.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-icon">{getFileIcon(file.mime_type)}</div>
              <div className="file-info">
                <a 
                  href={`${API_URL}${file.file_path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="file-name"
                >
                  {file.original_name}
                </a>
                <div className="file-meta">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Subido por: {file.uploader_name}</span>
                </div>
              </div>
              <button 
                className="btn-delete-file"
                onClick={() => handleDelete(file.id)}
                title="Eliminar archivo"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilesManager;
