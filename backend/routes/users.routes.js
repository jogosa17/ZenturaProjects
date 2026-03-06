const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/roles');

// Todas las rutas de usuarios requieren autenticación
router.use(authenticateToken);

// Rutas accesibles solo por administradores
// Crear trabajador
router.post('/workers', requireAdmin, userController.createWorker);

// Crear administrador
router.post('/admins', requireAdmin, userController.createAdmin);

// Listar trabajadores
router.get('/workers', requireAdmin, userController.getWorkers);

// Obtener usuario por ID
router.get('/:id', requireAdmin, userController.getUserById);

// Editar usuario
router.put('/:id', requireAdmin, userController.updateUser);

// Cambiar estado de usuario (activar/desactivar)
router.patch('/:id/status', requireAdmin, userController.toggleUserStatus);

module.exports = router;
