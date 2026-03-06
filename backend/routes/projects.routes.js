const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projects.controllers');
const upload = require('../middleware/upload.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin, requireWorker } = require('../middleware/roles');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Listar proyectos
router.get('/', requireWorker, projectController.getProjects);

// Obtener proyecto por ID
router.get('/:id', requireWorker, projectController.getProjectById);

// Crear proyecto
router.post('/', requireWorker, projectController.createProject);

// Actualizar proyecto
router.put('/:id', requireWorker, projectController.updateProject);

// Eliminar proyecto (Solo Admin)
router.delete('/:id', requireAdmin, projectController.deleteProject);

// Asignar trabajador
router.post('/:id/workers', requireAdmin, projectController.assignWorker);

// Remover trabajador
router.delete('/:id/workers/:workerId', requireAdmin, projectController.removeWorker);

// Subir presupuesto
router.post('/:id/budget', requireAdmin, upload.single('file'), projectController.uploadBudget);

// Subir factura
router.post('/:id/invoice', requireAdmin, upload.single('file'), projectController.uploadInvoice);

module.exports = router;
