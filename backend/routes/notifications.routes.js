const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener notificaciones
router.get('/', notificationController.getNotifications);

// Marcar todas como leídas
router.put('/read-all', notificationController.markAllAsRead);

// Marcar una como leída
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
