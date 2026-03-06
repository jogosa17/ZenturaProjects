import React, { useState, useEffect } from 'react';
import ConsultaService, { Consulta, Reply } from '../services/consulta.service';
import './ChatManager.css';

interface ChatManagerProps {
  projectId: number;
}

const ChatManager: React.FC<ChatManagerProps> = ({ projectId }) => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  // Obtener usuario actual para permisos de borrado
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  const fetchConsultas = async () => {
    setLoading(true);
    try {
      const result = await ConsultaService.getConsultasByProject(projectId);
      if (result.success) {
        setConsultas(result.data);
      }
    } catch (err) {
      console.error('Error al cargar consultas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchConsultas();
    }
  }, [projectId]);

  const handleCreateConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await ConsultaService.createConsulta({
        project_id: projectId,
        message: newMessage
      });
      setNewMessage('');
      fetchConsultas();
    } catch (err) {
      console.error('Error al crear consulta:', err);
      alert('Error al enviar mensaje');
    }
  };

  const handleReply = async (consultaId: number) => {
    if (!replyMessage.trim()) return;

    try {
      await ConsultaService.replyConsulta(consultaId, {
        message: replyMessage
      });
      setReplyMessage('');
      setActiveReplyId(null);
      fetchConsultas();
    } catch (err) {
      console.error('Error al responder:', err);
      alert('Error al enviar respuesta');
    }
  };

  const handleDeleteConsulta = async (id: number) => {
    if (window.confirm('¿Eliminar esta conversación completa?')) {
      try {
        await ConsultaService.deleteConsulta(id);
        fetchConsultas();
      } catch (err) {
        console.error('Error al eliminar consulta:', err);
      }
    }
  };

  const handleDeleteReply = async (id: number) => {
    if (window.confirm('¿Eliminar respuesta?')) {
      try {
        await ConsultaService.deleteReply(id);
        fetchConsultas();
      } catch (err) {
        console.error('Error al eliminar respuesta:', err);
      }
    }
  };

  const canDelete = (userId: number) => {
    return currentUser && (currentUser.role === 'admin' || currentUser.id === userId);
  };

  return (
    <div className="chat-manager">
      <div className="chat-header">
        <h3>Consultas y Comunicación</h3>
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleCreateConsulta} className="new-consulta-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Iniciar una nueva consulta o tema..."
            className="chat-textarea"
            rows={2}
          />
          <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
            Enviar
          </button>
        </form>
      </div>

      <div className="consultas-list">
        {loading && consultas.length === 0 ? (
          <p className="loading-text">Cargando chat...</p>
        ) : consultas.length === 0 ? (
          <p className="no-data">No hay consultas iniciadas en este proyecto.</p>
        ) : (
          consultas.map((consulta) => (
            <div key={consulta.id} className="consulta-thread">
              {/* Mensaje Principal */}
              <div className="message-bubble main">
                <div className="message-header">
                  <span className="author-name">{consulta.user_name}</span>
                  <span className="author-role badge">{consulta.user_role}</span>
                  <span className="message-date">{new Date(consulta.created_at).toLocaleString()}</span>
                  {canDelete(consulta.user_id) && (
                    <button onClick={() => handleDeleteConsulta(consulta.id)} className="btn-delete-msg" title="Eliminar hilo">×</button>
                  )}
                </div>
                <div className="message-body">{consulta.message}</div>
              </div>

              {/* Respuestas */}
              {consulta.replies && consulta.replies.length > 0 && (
                <div className="replies-list">
                  {consulta.replies.map((reply) => (
                    <div key={reply.id} className="message-bubble reply">
                      <div className="message-header">
                        <span className="author-name">{reply.user_name}</span>
                        <span className="author-role badge">{reply.user_role}</span>
                        <span className="message-date">{new Date(reply.created_at).toLocaleString()}</span>
                        {canDelete(reply.user_id) && (
                          <button onClick={() => handleDeleteReply(reply.id)} className="btn-delete-msg" title="Eliminar respuesta">×</button>
                        )}
                      </div>
                      <div className="message-body">{reply.message}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario de Respuesta */}
              <div className="reply-action">
                {activeReplyId === consulta.id ? (
                  <div className="reply-form">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Escribe una respuesta..."
                      className="reply-textarea"
                      rows={2}
                      autoFocus
                    />
                    <div className="reply-buttons">
                      <button onClick={() => handleReply(consulta.id)} className="btn-reply-send">Responder</button>
                      <button onClick={() => { setActiveReplyId(null); setReplyMessage(''); }} className="btn-reply-cancel">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setActiveReplyId(consulta.id)} className="btn-show-reply">
                    ↩ Responder
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatManager;
