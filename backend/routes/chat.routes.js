const express = require('express');
const router = express.Router();
const {
  getChatRooms,
  getChatMessages,
  sendMessage,
  markAsRead,
  getUnreadNotifications
} = require('../controllers/chat.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Obtener salas de chat del usuario
router.get('/rooms', getChatRooms);

// Obtener mensajes de una sala específica
router.get('/rooms/:roomId/messages', getChatMessages);

// Enviar mensaje a una sala
router.post('/rooms/:roomId/messages', sendMessage);

// Marcar mensajes como leídos
router.post('/rooms/:roomId/read', markAsRead);

// Obtener notificaciones no leídas
router.get('/notifications', getUnreadNotifications);

module.exports = router;
