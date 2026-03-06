const express = require('express');
const router = express.Router();
const noteController = require('../controllers/notes.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener notas de una tarea
router.get('/task/:taskId', noteController.getNotesByTask);

// Crear nota
router.post('/', noteController.createNote);

// Eliminar nota
router.delete('/:id', noteController.deleteNote);

module.exports = router;
