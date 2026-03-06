const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { createNotification } = require('../utils/notification.utils');

// Subir un archivo
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    const { project_id, task_id, consulta_id } = req.body;
    const uploaded_by = req.user.id;
    const { filename, originalname, path: filePath, size, mimetype } = req.file;

    // Guardar ruta relativa para servir estáticamente
    // Asumiendo que 'uploads' está en la raíz del proyecto backend o un nivel arriba
    // En index.js: app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    // El middleware guarda en ../uploads. La ruta relativa para la URL sería /uploads/filename
    const relativePath = `/uploads/${filename}`;

    const [result] = await pool.execute(
      `INSERT INTO files (
        filename, original_name, file_path, file_size, mime_type, 
        project_id, task_id, consulta_id, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        filename, 
        originalname, 
        relativePath, 
        size, 
        mimetype, 
        project_id || null, 
        task_id || null, 
        consulta_id || null, 
        uploaded_by
      ]
    );

    // Crear notificación
    let notifMessage = `Nuevo archivo subido: "${originalname}"`;
    let projectIdForNotif = project_id;

    if (task_id && !projectIdForNotif) {
      // Si está asociado a tarea, buscar el proyecto
      const [task] = await pool.execute('SELECT project_id FROM tasks WHERE id = ?', [task_id]);
      if (task.length > 0) projectIdForNotif = task[0].project_id;
      notifMessage += ' en una tarea';
    } else if (consulta_id && !projectIdForNotif) {
      const [consulta] = await pool.execute('SELECT project_id FROM consultas WHERE id = ?', [consulta_id]);
      if (consulta.length > 0) projectIdForNotif = consulta[0].project_id;
      notifMessage += ' en una consulta';
    }

    await createNotification({
      projectId: projectIdForNotif,
      type: 'file_uploaded',
      message: notifMessage,
      toAdmin: true,
      excludeUserId: uploaded_by
    });

    res.status(201).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: {
        id: result.insertId,
        filename,
        original_name: originalname,
        file_path: relativePath,
        size,
        mime_type: mimetype,
        uploaded_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    // Intentar borrar el archivo si falló la BD
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error al borrar archivo tras fallo:', err);
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al procesar la subida del archivo'
    });
  }
};

// Listar archivos
const getFiles = async (req, res) => {
  try {
    const { projectId, taskId, consultaId } = req.query;

    let query = `
      SELECT f.*, u.name as uploader_name 
      FROM files f
      JOIN users u ON f.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (projectId) {
      query += ' AND f.project_id = ?';
      params.push(projectId);
    }
    if (taskId) {
      query += ' AND f.task_id = ?';
      params.push(taskId);
    }
    if (consultaId) {
      query += ' AND f.consulta_id = ?';
      params.push(consultaId);
    }

    query += ' ORDER BY f.created_at DESC';

    const [files] = await pool.execute(query, params);

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de archivos'
    });
  }
};

// Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener info del archivo primero
    const [files] = await pool.execute('SELECT * FROM files WHERE id = ?', [id]);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    const file = files[0];
    
    // Verificar permisos: admin o el que lo subió
    if (req.user.role !== 'admin' && req.user.id !== file.uploaded_by) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este archivo'
      });
    }

    // Borrar de BD
    await pool.execute('DELETE FROM files WHERE id = ?', [id]);

    // Borrar de disco
    // Construir ruta absoluta. file.file_path es relativo (/uploads/...)
    // En middleware definimos uploadDir como path.join(__dirname, '../../uploads')
    // file_path guarda /uploads/filename. Necesitamos quitar el primer / y unir.
    
    // O mejor, usar la ruta configurada en el servidor.
    // Asumimos estructura: backend/controllers, backend/uploads (o root/uploads)
    // Ajustar según donde esté la carpeta uploads real.
    // El middleware usó: path.join(__dirname, '../../uploads') desde backend/middleware
    // Entonces es root/uploads.
    // Desde aquí (backend/controllers), es ../../uploads
    
    const absolutePath = path.join(__dirname, '../../', file.file_path);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlink(absolutePath, (err) => {
        if (err) console.error('Error al borrar archivo físico:', err);
      });
    }

    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo'
    });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile
};
