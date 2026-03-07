const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { globalSearch, quickSearch, getSearchStats } = require('../controllers/search.controllers');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Búsqueda global
router.get('/', globalSearch);

// Búsqueda rápida (autocomplete)
router.get('/quick', quickSearch);

// Estadísticas de búsqueda
router.get('/stats', getSearchStats);

module.exports = router;
