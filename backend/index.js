const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const clientRoutes = require('./routes/clients.routes');
const projectRoutes = require('./routes/projects.routes');
const zoneRoutes = require('./routes/zones.routes');
const taskRoutes = require('./routes/tasks.routes');
const fileRoutes = require('./routes/files.routes');
const noteRoutes = require('./routes/notes.routes');
const consultaRoutes = require('./routes/consultas.routes');
const notificationRoutes = require('./routes/notifications.routes');
const agendaRoutes = require('./routes/agenda.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const searchRoutes = require('./routes/search.routes');
const chatRoutes = require('./routes/chat.routes');
const assignmentRoutes = require('./routes/assignments.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
// Asegura que la ruta coincida con lo que guardamos en BD (/uploads/filename)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assignments', assignmentRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Zentura Projects API - Servidor funcionando correctamente' });
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API de Zentura Projects',
    version: '1.0.0',
    status: 'running'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}`);
});

module.exports = app;
