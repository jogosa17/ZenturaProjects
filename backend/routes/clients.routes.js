const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clients.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin, requireWorker } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar clientes - Accesible para admins y trabajadores
router.get('/', requireWorker, clientController.getClients);

// Obtener cliente por ID - Accesible para admins y trabajadores
router.get('/:id', requireWorker, clientController.getClientById);

// Crear cliente - Solo admins y trabajadores (según lógica de negocio, asumiremos ambos por ahora, o solo admin si es estricto)
// Generalmente los trabajadores también pueden registrar clientes en campo
router.post('/', requireWorker, clientController.createClient);

// Editar cliente - Solo admins y trabajadores
router.put('/:id', requireWorker, clientController.updateClient);

// Eliminar cliente - Solo admins
router.delete('/:id', requireAdmin, clientController.deleteClient);

module.exports = router;
