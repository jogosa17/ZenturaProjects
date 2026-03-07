const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { getAgenda, getAgendaByDateRange, getUpcomingProjects } = require('../controllers/agenda.controllers');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Obtener agenda completa del usuario
router.get('/', getAgenda);

// Obtener eventos por rango de fechas (para calendario)
router.get('/range', getAgendaByDateRange);

// Obtener proyectos próximos (30 días)
router.get('/upcoming', getUpcomingProjects);

module.exports = router;
