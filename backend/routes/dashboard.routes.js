const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { getDashboardStats, getRecentActivity, getRecentNotifications } = require('../controllers/dashboard.controllers');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Obtener estadísticas principales del dashboard
router.get('/stats', getDashboardStats);

// Obtener actividad reciente
router.get('/activity', getRecentActivity);

// Obtener notificaciones recientes
router.get('/notifications', getRecentNotifications);

module.exports = router;
