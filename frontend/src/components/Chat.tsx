import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
  id: number;
  message: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  replyTo?: {
    id: number;
    message: string;
    user: string;
  };
}

interface ChatRoom {
  id: number;
  name: string;
  type: 'project' | 'general';
  project?: {
    id: number;
    name: string;
    status: string;
  };
  userRole: string;
  unreadCount: number;
  totalMessages: number;
  lastMessageTime?: string;
  lastMessageUser?: string;
  lastMessageContent?: string;
}

interface ChatProps {
  user: {
    id: number;
    name: string;
    role: string;
  };
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Obtener salas de chat
  useEffect(() => {
    fetchChatRooms();
    fetchNotifications();
    
    // Configurar polling para notificaciones
    const notificationInterval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(notificationInterval);
  }, []);

  // Obtener mensajes cuando se selecciona una sala
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      
      // Configurar polling para nuevos mensajes
      const messageInterval = setInterval(() => {
        fetchMessages(selectedRoom.id);
      }, 5000);
      
      return () => clearInterval(messageInterval);
    }
  }, [selectedRoom]);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error al obtener salas:', error);
    }
  };

  const fetchMessages = async (roomId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Los mensajes vienen en orden descendente del backend, pero para asegurar
        // que el más nuevo aparezca arriba, no revertimos el array
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setUnreadNotifications(data.unreadCount);
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          messageType: 'text',
          replyToId: replyingTo?.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        setReplyingTo(null);
        // Refrescar mensajes para mostrar el nuevo mensaje
        fetchMessages(selectedRoom.id);
        fetchChatRooms(); // Actualizar contador de no leídos
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const markAsRead = async (roomId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/rooms/${roomId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizar contadores
      fetchChatRooms();
      fetchNotifications();
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getRoomIcon = (type: string) => {
    return type === 'general' ? '👥' : '🏗️';
  };

  return (
    <div className="chat-container">
      {/* Lista de salas */}
      <div className="chat-rooms">
        <div className="chat-header">
          <h3>💬 Chat Interno</h3>
          {unreadNotifications > 0 && (
            <span className="notification-badge">{unreadNotifications}</span>
          )}
        </div>
        
        <div className="rooms-list">
          {rooms.map(room => (
            <div
              key={room.id}
              className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedRoom(room);
                markAsRead(room.id);
              }}
            >
              <div className="room-info">
                <div className="room-title">
                  <span className="room-icon">{getRoomIcon(room.type)}</span>
                  <span className="room-name">{room.name}</span>
                </div>
                {room.project && (
                  <div className="room-project">{room.project.name}</div>
                )}
              </div>
              
              <div className="room-status">
                {room.unreadCount > 0 && (
                  <span className="unread-count">{room.unreadCount}</span>
                )}
                {room.lastMessageContent && (
                  <div className="last-message">
                    <span className="last-user">{room.lastMessageUser}:</span>
                    <span className="last-text">{room.lastMessageContent}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="chat-messages">
        {selectedRoom ? (
          <>
            <div className="messages-header">
              <div className="room-info-header">
                <h4>{selectedRoom.name}</h4>
                {selectedRoom.project && (
                  <span className="project-badge">{selectedRoom.project.name}</span>
                )}
              </div>
              <div className="room-stats">
                <span className="total-messages">{selectedRoom.totalMessages} mensajes</span>
              </div>
            </div>
            
            <div className="messages-container">
              {messages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="date-separator">
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    )}
                    
                    <div className={`message ${message.user.id === user.id ? 'own' : 'other'}`}>
                      <div className="message-content">
                        {message.user.id !== user.id && (
                          <div className="message-user">
                            <span className="user-name">{message.user.name}</span>
                            <span className="user-role">{message.user.role}</span>
                          </div>
                        )}
                        
                        {message.replyTo && (
                          <div className="reply-to">
                            <span>Respondiendo a {message.replyTo.user}:</span>
                            <div className="reply-message">{message.replyTo.message}</div>
                          </div>
                        )}
                        
                        <div className="message-text">{message.message}</div>
                        
                        {message.isEdited && (
                          <span className="edited-indicator">(editado)</span>
                        )}
                        
                        <div className="message-time">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Área de respuesta */}
            {replyingTo && (
              <div className="reply-area">
                <div className="reply-info">
                  <span>Respondiendo a {replyingTo.user.name}:</span>
                  <div className="reply-text">{replyingTo.message}</div>
                </div>
                <button 
                  className="cancel-reply"
                  onClick={() => setReplyingTo(null)}
                >
                  ✖️
                </button>
              </div>
            )}
            
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Escribe un mensaje..."
                disabled={loading}
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
                className="send-button"
              >
                {loading ? '⏳' : '📤'}
              </button>
            </div>
          </>
        ) : (
          <div className="no-room-selected">
            <div className="welcome-message">
              <h3>💬 Bienvenido al Chat Interno</h3>
              <p>Selecciona una sala para comenzar a conversar</p>
              <div className="chat-info">
                <p><strong>Para Admins:</strong> Verás todos los proyectos</p>
                <p><strong>Para Workers:</strong> Solo verás tus proyectos asignados</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
