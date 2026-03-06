const { pool } = require('../config/database');

// Crear un nuevo proyecto
const createProject = async (req, res) => {
  try {
    const { 
      name, client_id, location, phone, contact_person, contact_phone, 
      comments, priority, status, start_date, end_date, is_urgent 
    } = req.body;

    if (!name || !client_id) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del proyecto y el cliente son obligatorios'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO projects (
        name, client_id, location, phone, contact_person, contact_phone, 
        comments, priority, status, start_date, end_date, is_urgent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, client_id, location, phone, contact_person, contact_phone, 
        comments, priority || 'low', status || 'started', start_date || null, end_date || null, is_urgent || false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: {
        id: result.insertId,
        ...req.body
      }
    });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el proyecto'
    });
  }
};

// Listar todos los proyectos
const getProjects = async (req, res) => {
  try {
    const [projects] = await pool.execute(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de proyectos'
    });
  }
};

// Obtener proyecto por ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener detalles del proyecto con archivos de presupuesto y factura
    const [projects] = await pool.execute(`
      SELECT p.*, c.name as client_name,
      bf.id as budget_file_id, bf.filename as budget_filename, bf.original_name as budget_original_name, bf.file_path as budget_file_path,
      inf.id as invoice_file_id, inf.filename as invoice_filename, inf.original_name as invoice_original_name, inf.file_path as invoice_file_path
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN files bf ON p.budget_file_id = bf.id
      LEFT JOIN files inf ON p.invoice_file_id = inf.id
      WHERE p.id = ?
    `, [id]);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    const project = projects[0];

    // Estructurar objetos de archivo si existen
    if (project.budget_file_id) {
      project.budget_file = {
        id: project.budget_file_id,
        filename: project.budget_filename,
        original_name: project.budget_original_name,
        file_path: project.budget_file_path
      };
    }
    // Limpiar campos planos
    delete project.budget_filename;
    delete project.budget_original_name;
    delete project.budget_file_path;

    if (project.invoice_file_id) {
      project.invoice_file = {
        id: project.invoice_file_id,
        filename: project.invoice_filename,
        original_name: project.invoice_original_name,
        file_path: project.invoice_file_path
      };
    }
    // Limpiar campos planos
    delete project.invoice_filename;
    delete project.invoice_original_name;
    delete project.invoice_file_path;

    // Obtener trabajadores asignados
    const [workers] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN project_workers pw ON u.id = pw.worker_id
      WHERE pw.project_id = ?
    `, [id]);

    project.workers = workers;

    // Calcular presupuesto total (suma de precios de tareas)
    const [budgetResult] = await pool.execute(`
      SELECT COALESCE(SUM(t.price), 0) as total_budget
      FROM tasks t
      JOIN zones z ON t.zone_id = z.id
      WHERE z.project_id = ?
    `, [id]);

    project.total_budget = parseFloat(budgetResult[0].total_budget);

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los detalles del proyecto'
    });
  }
};

// Actualizar proyecto
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, client_id, location, phone, contact_person, contact_phone, 
      comments, priority, status, start_date, end_date, is_urgent 
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE projects SET 
        name = ?, client_id = ?, location = ?, phone = ?, contact_person = ?, 
        contact_phone = ?, comments = ?, priority = ?, status = ?, 
        start_date = ?, end_date = ?, is_urgent = ?
      WHERE id = ?`,
      [
        name, client_id, location, phone, contact_person, contact_phone, 
        comments, priority, status, start_date, end_date, is_urgent, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el proyecto'
    });
  }
};

// Eliminar proyecto
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el proyecto'
    });
  }
};

// Asignar trabajador a proyecto
const assignWorker = async (req, res) => {
  try {
    const { id } = req.params; // project_id
    const { worker_id } = req.body;

    if (!worker_id) {
      return res.status(400).json({
        success: false,
        message: 'ID de trabajador requerido'
      });
    }

    // Verificar si ya está asignado
    const [existing] = await pool.execute(
      'SELECT * FROM project_workers WHERE project_id = ? AND worker_id = ?',
      [id, worker_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El trabajador ya está asignado a este proyecto'
      });
    }

    await pool.execute(
      'INSERT INTO project_workers (project_id, worker_id) VALUES (?, ?)',
      [id, worker_id]
    );

    res.json({
      success: true,
      message: 'Trabajador asignado exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar trabajador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar trabajador al proyecto'
    });
  }
};

// Remover trabajador de proyecto
const removeWorker = async (req, res) => {
  try {
    const { id, workerId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM project_workers WHERE project_id = ? AND worker_id = ?',
      [id, workerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Trabajador removido del proyecto exitosamente'
    });
  } catch (error) {
    console.error('Error al remover trabajador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al remover trabajador del proyecto'
    });
  }
};

// Subir Presupuesto
const uploadBudget = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    const uploaded_by = req.user.id;
    const { filename, originalname, path: filePath, size, mimetype } = req.file;
    const relativePath = `/uploads/${filename}`;

    // 1. Insertar archivo en tabla files
    const [fileResult] = await pool.execute(
      `INSERT INTO files (
        filename, original_name, file_path, file_size, mime_type, 
        project_id, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [filename, originalname, relativePath, size, mimetype, id, uploaded_by]
    );

    const fileId = fileResult.insertId;

    // 2. Actualizar budget_file_id en projects
    await pool.execute(
      'UPDATE projects SET budget_file_id = ? WHERE id = ?',
      [fileId, id]
    );

    res.status(201).json({
      success: true,
      message: 'Presupuesto subido exitosamente',
      data: {
        id: fileId,
        filename,
        original_name: originalname,
        file_path: relativePath
      }
    });
  } catch (error) {
    console.error('Error al subir presupuesto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el presupuesto'
    });
  }
};

// Subir Factura
const uploadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    const uploaded_by = req.user.id;
    const { filename, originalname, path: filePath, size, mimetype } = req.file;
    const relativePath = `/uploads/${filename}`;

    // 1. Insertar archivo en tabla files
    const [fileResult] = await pool.execute(
      `INSERT INTO files (
        filename, original_name, file_path, file_size, mime_type, 
        project_id, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [filename, originalname, relativePath, size, mimetype, id, uploaded_by]
    );

    const fileId = fileResult.insertId;

    // 2. Actualizar invoice_file_id en projects
    await pool.execute(
      'UPDATE projects SET invoice_file_id = ? WHERE id = ?',
      [fileId, id]
    );

    res.status(201).json({
      success: true,
      message: 'Factura subida exitosamente',
      data: {
        id: fileId,
        filename,
        original_name: originalname,
        file_path: relativePath
      }
    });
  } catch (error) {
    console.error('Error al subir factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la factura'
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignWorker,
  removeWorker,
  uploadBudget,
  uploadInvoice
};
