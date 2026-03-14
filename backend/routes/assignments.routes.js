const express = require('express');
const router = express.Router();
const {
  getAvailableWorkers,
  assignWorkerToProject,
  unassignWorkerFromProject,
  getProjectAssignments
} = require('../controllers/assignments.controllers');
const { authenticateToken } = require('../middleware/auth.middleware');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Obtener trabajadores disponibles para asignar a un proyecto
router.get('/projects/:projectId/workers/available', getAvailableWorkers);

// Obtener asignaciones de un proyecto
router.get('/projects/:projectId/workers/assigned', getProjectAssignments);

// Asignar worker a proyecto
router.post('/projects/:projectId/workers/:workerId/assign', assignWorkerToProject);

// Desasignar worker de proyecto
router.delete('/projects/:projectId/workers/:workerId/unassign', unassignWorkerFromProject);

module.exports = router;
