import React, { useState, useEffect } from 'react';
import { dashboardService, DashboardStats } from '../services/dashboard.service';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState({ x: 25, y: 25, width: 350, height: 350 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });

  useEffect(() => {
    loadUserData();
    
    // Escuchar cambios en localStorage (por si el usuario se loguea en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log('🔍 Dashboard: Cambio detectado en localStorage');
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También verificar periódicamente
    const interval = setInterval(() => {
      loadUserData();
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    console.log('🔍 Cargando usuario desde localStorage:', userStr);
    
    if (userStr && userStr !== 'null' && userStr !== 'undefined') {
      try {
        const userData = JSON.parse(userStr);
        console.log('🔍 Usuario parseado:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Error parseando usuario:', error);
        setUser(null);
      }
    } else {
      console.log('🔍 No hay usuario en localStorage');
      setUser(null);
    }
  };

  const handleAvatarClick = () => {
    setIsEditingAvatar(true);
  };

  const handleCameraOption = () => {
    setShowCameraModal(true);
    setIsEditingAvatar(false);
  };

  const handleGalleryOption = () => {
    setShowGalleryModal(true);
    setIsEditingAvatar(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedImage(base64);
        setShowCropModal(true);
        setShowGalleryModal(false);
        setIsEditingAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: croppedImage };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('📸 Avatar recortado y guardado');
    }
    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('crop-resize-handle')) {
      // Redimensionar
      console.log('🔍 Iniciando redimensionamiento');
      setIsResizing(true);
      setResizeStart({ width: cropArea.width, height: cropArea.height });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (target.classList.contains('crop-box')) {
      // Mover - hacer clic directamente en el borde
      console.log('🔍 Iniciando movimiento en el borde');
      setIsDragging(true);
      
      const img = document.getElementById('crop-image') as HTMLImageElement;
      const cropBox = document.getElementById('crop-box') as HTMLElement;
      
      if (img && cropBox) {
        const imgRect = img.getBoundingClientRect();
        const cropRect = cropBox.getBoundingClientRect();
        
        const mouseX = e.clientX - imgRect.left;
        const mouseY = e.clientY - imgRect.top;
        
        setDragStart({ 
          x: mouseX - (cropRect.left - imgRect.left), 
          y: mouseY - (cropRect.top - imgRect.top) 
        });
      }
    }
  };

  const handleCropMouseMove = (e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const img = document.getElementById('crop-image') as HTMLImageElement;
    if (!img) return;
    
    const imgRect = img.getBoundingClientRect();

    if (isDragging) {
      // Mover el área de recorte
      const newX = e.clientX - imgRect.left - dragStart.x;
      const newY = e.clientY - imgRect.top - dragStart.y;
      
      const maxX = imgRect.width - cropArea.width;
      const maxY = imgRect.height - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      }));
    } else if (isResizing) {
      // Redimensionar el área de recorte
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newWidth = Math.max(50, Math.min(500, resizeStart.width + deltaX));
      const newHeight = Math.max(50, Math.min(500, resizeStart.height + deltaY));
      
      console.log('🔍 Redimensionando:', { newWidth, newHeight, deltaX, deltaY });
      
      // Ajustar posición si se sale de los bordes
      const maxX = imgRect.width - newWidth;
      const maxY = imgRect.height - newHeight;
      
      setCropArea(prev => {
        const updated = {
          ...prev,
          width: newWidth,
          height: newHeight,
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY)
        };
        console.log('🔍 Nuevo cropArea:', updated);
        return updated;
      });
    }
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (showCropModal) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleCropMouseMove(e as any);
      const handleGlobalMouseUp = () => handleCropMouseUp();

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [showCropModal, isDragging, isResizing, dragStart]);

  useEffect(() => {
    console.log('🔍 cropArea actualizado:', cropArea);
  }, [cropArea]);

  const performCrop = () => {
    const img = document.getElementById('crop-image') as HTMLImageElement;
    
    if (!img) return;
    
    console.log('🔍 Usando cropArea del estado:', cropArea);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Obtener dimensiones reales de la imagen
    const imgRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    
    // Usar las dimensiones del estado cropArea, no del elemento visual
    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleX; // Mantener proporción circular
    
    console.log('🔍 Dimensiones de recorte corregidas:', { cropX, cropY, cropWidth, cropHeight });
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    // Crear máscara circular
    ctx.beginPath();
    ctx.arc(cropWidth / 2, cropHeight / 2, Math.min(cropWidth, cropHeight) / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    
    // Dibujar la porción recortada
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    
    // Convertir a base64
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
    handleCropComplete(croppedBase64);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      console.log('📸 Archivo seleccionado:', file);
      
      // Crear FormData para subir la imagen
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Por ahora, simulamos la subida convirtiendo a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log('📸 Imagen convertida a base64:', base64.substring(0, 50) + '...');
        
        // Actualizar el usuario con la nueva imagen
        if (user) {
          const updatedUser = { ...user, avatar: base64 };
          setUser(updatedUser);
          
          // Guardar en localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('📸 Usuario actualizado en localStorage:', updatedUser);
          
          // Forzar re-renderizado
          setTimeout(() => {
            console.log('📸 Estado actual del usuario:', user);
          }, 100);
        }
      };
      reader.readAsDataURL(file);
      
      setIsEditingAvatar(false);
    } catch (error) {
      console.error('❌ Error subiendo avatar:', error);
      setIsEditingAvatar(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Solicitar acceso a la cámara
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Crear elemento video
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Crear canvas para capturar la foto
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Esperar a que el video esté listo
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0);
        
        // Convertir a base64
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        // Actualizar el usuario
        if (user) {
          const updatedUser = { ...user, avatar: base64 };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('📸 Foto de cámara capturada');
        }
        
        // Detener la cámara
        stream.getTracks().forEach(track => track.stop());
      };
      
      setIsEditingAvatar(false);
    } catch (error) {
      console.error('❌ Error accediendo a la cámara:', error);
      setIsEditingAvatar(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      'finalizada': '#28a745'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // Eliminamos la condición de error para que siempre renderice

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
      </div>
      
      {/* Tarjeta de información del usuario */}
      {user && (
        <div className="user-info-card">
          <div className="user-avatar" onClick={handleAvatarClick}>
            {isEditingAvatar ? (
              <div className="avatar-edit-overlay">
                <div className="avatar-edit-menu">
                  <button 
                    onClick={handleCameraOption}
                    className="avatar-option-btn camera"
                    title="Cámara"
                  >
                    📷
                  </button>
                  
                  <label className="avatar-option-btn gallery" title="Galería">
                    🖼️
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <>
                {console.log('🔍 Renderizando avatar - user.avatar:', user.avatar)}
                {user.avatar ? (
                  <>
                    {console.log('🖼️ Mostrando imagen de avatar')}
                    <img src={user.avatar} alt="Avatar" className="avatar-image" />
                  </>
                ) : (
                  <>
                    {console.log('👤 Mostrando icono por defecto')}
                    <span className="avatar-icon">👤</span>
                  </>
                )}
                <div className="avatar-edit-button" onClick={(e) => e.stopPropagation()} title="Cambiar avatar">
                  <span className="edit-icon">✏️</span>
                </div>
              </>
            )}
          </div>
          <div className="user-details">
            <h3 className="user-name">{user.username || user.name || 'Usuario'}</h3>
            <p className="user-email">{user.role === 'admin' ? 'Administrador' : user.role === 'worker' ? 'Trabajador' : 'Usuario'}</p>
          </div>
        </div>
      )}
      
      {/* Modal de Cámara */}
      {showCameraModal && (
        <div className="camera-modal-overlay" onClick={() => setShowCameraModal(false)}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>📷 Cámara</h3>
              <button className="close-btn" onClick={() => setShowCameraModal(false)}>✖️</button>
            </div>
            <div className="camera-modal-content">
              <video id="camera-video" autoPlay playsInline muted></video>
              <canvas id="camera-canvas" style={{ display: 'none' }}></canvas>
              <div className="camera-controls">
                <button className="capture-btn" onClick={handleCameraCapture}>
                  📸 Capturar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Galería */}
      {showGalleryModal && (
        <div className="gallery-modal-overlay" onClick={() => setShowGalleryModal(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-modal-header">
              <h3>📁 Galería</h3>
              <button className="close-btn" onClick={() => setShowGalleryModal(false)}>✖️</button>
            </div>
            <div className="gallery-modal-content">
              <div className="gallery-placeholder">
                <p>📸 Selecciona una imagen de tu dispositivo</p>
                <label className="gallery-select-btn">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <span>Seleccionar Archivo</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Recorte de Imagen */}
      {showCropModal && selectedImage && (
        <div className="crop-modal-overlay" onClick={() => setShowCropModal(false)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crop-modal-header">
              <h3>✂️ Recortar Imagen</h3>
              <button className="close-btn" onClick={() => setShowCropModal(false)}>✖️</button>
            </div>
            <div className="crop-modal-content">
              <div className="crop-container">
                <img 
                  src={selectedImage} 
                  alt="Imagen para recortar" 
                  className="crop-image"
                  id="crop-image"
                />
                <div 
                  className="crop-box" 
                  id="crop-box"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`
                  }}
                  onMouseDown={handleCropMouseDown}
                >
                  {/* Control de redimensionamiento */}
                  <div 
                    className="crop-resize-handle bottom-right"
                    onMouseDown={handleCropMouseDown}
                  ></div>
                </div>
              </div>
              <div className="crop-controls">
                <button className="crop-cancel-btn" onClick={() => setShowCropModal(false)}>
                  Cancelar
                </button>
                <button className="crop-confirm-btn" onClick={() => performCrop()}>
                  ✂️ Recortar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
