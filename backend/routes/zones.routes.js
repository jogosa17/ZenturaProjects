const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zones.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin, requireWorker } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar zonas de un proyecto
router.get('/project/:projectId', requireWorker, zoneController.getZonesByProject);

// Crear zona
router.post('/', requireWorker, zoneController.createZone);

// Actualizar zona
router.put('/:id', requireWorker, zoneController.updateZone);

// Eliminar zona (Solo Admin)
router.delete('/:id', requireAdmin, zoneController.deleteZone);

module.exports = router;
