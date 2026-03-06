const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultas.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener consultas de un proyecto
router.get('/project/:projectId', consultaController.getConsultasByProject);

// Crear consulta (hilo)
router.post('/', consultaController.createConsulta);

// Responder a una consulta
router.post('/:consulta_id/reply', consultaController.replyConsulta);

// Eliminar consulta
router.delete('/:id', consultaController.deleteConsulta);

// Eliminar respuesta
router.delete('/reply/:id', consultaController.deleteReply);

module.exports = router;
