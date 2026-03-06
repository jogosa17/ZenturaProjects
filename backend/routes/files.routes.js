const express = require('express');
const router = express.Router();
const fileController = require('../controllers/files.controllers');
const upload = require('../middleware/upload.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Subir archivo
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Listar archivos
router.get('/', fileController.getFiles);

// Eliminar archivo
router.delete('/:id', fileController.deleteFile);

module.exports = router;
