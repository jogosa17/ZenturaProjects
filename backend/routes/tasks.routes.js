const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tasks.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin, requireWorker } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar tareas de una zona
router.get('/zone/:zoneId', requireWorker, taskController.getTasksByZone);

// Crear tarea
router.post('/', requireWorker, taskController.createTask);

// Actualizar tarea
router.put('/:id', requireWorker, taskController.updateTask);

// Eliminar tarea
router.delete('/:id', requireWorker, taskController.deleteTask);

module.exports = router;
