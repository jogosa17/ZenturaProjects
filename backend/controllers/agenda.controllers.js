const { pool } = require('../config/database');

// Obtener agenda del usuario
async function getAgenda(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        p.id,
        p.name as project_name,
        p.start_date,
        p.end_date,
        p.status,
        p.priority,
        c.name as client_name,
        GROUP_CONCAT(DISTINCT u.name) as workers
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      LEFT JOIN users u ON pw.user_id = u.id
    `;

    if (userRole === 'admin') {
      query += ` GROUP BY p.id ORDER BY p.start_date ASC, p.end_date ASC`;
    } else {
      query += ` WHERE pw.user_id = ? GROUP BY p.id ORDER BY p.start_date ASC, p.end_date ASC`;
    }

    const [projects] = await pool.execute(query, userRole === 'admin' ? [] : [userId]);

    // Formatear los datos para la agenda
    const agenda = projects.map(project => ({
      id: project.id,
      title: project.project_name,
      client: project.client_name,
      workers: project.workers ? project.workers.split(',') : [],
      start: project.start_date,
      end: project.end_date,
      status: project.status,
      priority: project.priority,
      type: 'project'
    }));

    res.json({
      success: true,
      data: agenda
    });

  } catch (error) {
    console.error('Error obteniendo agenda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la agenda'
    });
  }
}

// Obtener eventos de agenda por rango de fechas
async function getAgendaByDateRange(req, res) {
  try {
    const { start, end } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas de inicio y fin son requeridas'
      });
    }

    let query = `
      SELECT 
        p.id,
        p.name as project_name,
        p.start_date,
        p.end_date,
        p.status,
        p.priority,
        c.name as client_name,
        GROUP_CONCAT(DISTINCT u.name) as workers
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      LEFT JOIN users u ON pw.user_id = u.id
      WHERE p.start_date <= ? AND (p.end_date >= ? OR p.end_date IS NULL)
    `;

    if (userRole === 'admin') {
      query += ` GROUP BY p.id ORDER BY p.start_date ASC`;
    } else {
      query += ` AND pw.user_id = ? GROUP BY p.id ORDER BY p.start_date ASC`;
    }

    const [projects] = await pool.execute(
      query, 
      userRole === 'admin' ? [end, start] : [end, start, userId]
    );

    // Formatear para calendario
    const events = projects.map(project => ({
      id: project.id,
      title: `${project.project_name} - ${project.client_name}`,
      start: project.start_date,
      end: project.end_date,
      backgroundColor: getPriorityColor(project.priority),
      borderColor: getPriorityColor(project.priority),
      extendedProps: {
        client: project.client_name,
        workers: project.workers ? project.workers.split(',') : [],
        status: project.status,
        priority: project.priority
      }
    }));

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Error obteniendo agenda por fechas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la agenda'
    });
  }
}

// Obtener proyectos próximos (próximos 30 días)
async function getUpcomingProjects(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        p.id,
        p.name as project_name,
        p.start_date,
        p.end_date,
        p.status,
        p.priority,
        c.name as client_name,
        DATEDIFF(p.start_date, CURDATE()) as days_until_start
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      WHERE p.start_date > CURDATE()
      AND p.start_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `;

    if (userRole === 'admin') {
      query += ` GROUP BY p.id ORDER BY p.start_date ASC`;
    } else {
      query += ` AND pw.user_id = ? GROUP BY p.id ORDER BY p.start_date ASC`;
    }

    const [projects] = await pool.execute(
      query, 
      userRole === 'admin' ? [] : [userId]
    );

    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('Error obteniendo proyectos próximos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos próximos'
    });
  }
}

// Función auxiliar para obtener color según prioridad
function getPriorityColor(priority) {
  const colors = {
    'urgente': '#dc3545',
    'alta': '#fd7e14',
    'normal': '#0d6efd',
    'baja': '#198754'
  };
  return colors[priority] || '#6c757d';
}

module.exports = {
  getAgenda,
  getAgendaByDateRange,
  getUpcomingProjects
};
