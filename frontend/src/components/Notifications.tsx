import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationService, { Notification } from '../services/notification.service';
import './Notifications.css';

const NotificationsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpdateUnread: (count: number) => void;
}> = ({ isOpen, onClose, onUpdateUnread }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await NotificationService.getNotifications();
      if (result.success) {
        setNotifications(result.data);
        onUpdateUnread(result.unreadCount);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    await handleMarkAsRead(notification.id, notification.is_read);
    
    // Redirigir según el tipo de notificación
    if (notification.task_id && notification.project_id) {
      // Construir URL para ir al proyecto, zona y tarea específica
      const projectUrl = `/projects/${notification.project_id}`;
      
      // Si hay zone_id, intentamos ir directamente a la tarea
      if (notification.zone_id) {
        const taskUrl = `${projectUrl}?zone=${notification.zone_id}&task=${notification.task_id}`;
        navigate(taskUrl);
      } else {
        navigate(projectUrl);
      }
    } else if (notification.project_id) {
      // Si solo hay project_id, ir al proyecto
      navigate(`/projects/${notification.project_id}`);
    }
    
    // Cerrar el panel de notificaciones
    onClose();
  };

  const handleMarkAsRead = async (id: number, isRead: boolean | number) => {
    if (isRead) return; // Ya leída
    try {
      await NotificationService.markAsRead(id);
      // Actualizar estado local
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      // Actualizar contador global (asumimos que disminuye en 1)
      // Idealmente haríamos refetch o callback
      fetchNotifications(); 
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-panel" ref={panelRef}>
      <div className="notifications-header">
        <h3>Notificaciones</h3>
        <button onClick={handleMarkAllRead} className="btn-mark-all">
          Marcar todo leído
        </button>
      </div>
      
      <div className="notifications-list">
        {loading ? (
          <div className="notif-loading">Cargando...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">No tienes notificaciones</div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notif-content">
                <p className="notif-message">{notif.message}</p>
                <div className="notif-meta">
                  {notif.project_name && <span className="notif-project">{notif.project_name}</span>}
                  <span className="notif-date">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
              </div>
              {!notif.is_read && <span className="unread-dot"></span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Cargar conteo inicial
    const checkUnread = async () => {
      try {
        const result = await NotificationService.getNotifications(true);
        if (result.success) {
          setUnreadCount(result.unreadCount);
        }
      } catch (err) {
        // Silencioso
      }
    };
    
    checkUnread();
    
    // Polling cada 60 segundos
    const interval = setInterval(checkUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-wrapper">
      <button 
        className="notification-bell-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      
      <NotificationsPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onUpdateUnread={setUnreadCount}
      />
    </div>
  );
};
