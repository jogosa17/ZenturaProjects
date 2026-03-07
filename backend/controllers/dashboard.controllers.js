const { pool } = require('../config/database');

// Obtener estadísticas generales del dashboard
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = '';
    let params = [];

    if (userRole !== 'admin') {
      whereClause = 'WHERE pw.user_id = ?';
      params = [userId];
    }

    // Estadísticas básicas
    const [projectsStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'started' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as pending_projects
      FROM projects p
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
    `, params);

    const [tasksStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_tasks,
        SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(price) as total_budget
      FROM tasks t
      LEFT JOIN zones z ON t.zone_id = z.id
      LEFT JOIN projects p ON z.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
    `, params);

    const [clientsCount] = await pool.execute(`
      SELECT COUNT(DISTINCT client_id) as total_clients
      FROM projects p
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
    `, params);

    // Estadísticas de usuarios (solo admin)
    let usersStats = { total_users: 0, active_users: 0 };
    if (userRole === 'admin') {
      const [users] = await pool.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_users
        FROM users
      `);
      usersStats = users[0];
    }

    // Actividad reciente
    const [recentActivity] = await pool.execute(`
      SELECT 
        'task' as type,
        t.name as title,
        t.status,
        t.updated_at as date,
        p.name as project_name,
        u.name as user_name
      FROM tasks t
      LEFT JOIN zones z ON t.zone_id = z.id
      LEFT JOIN projects p ON z.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      LEFT JOIN users u ON t.updated_by = u.id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'consulta' as type,
        SUBSTRING(message, 1, 50) as title,
        'created' as status,
        c.created_at as date,
        p.name as project_name,
        u.name as user_name
      FROM consultas c
      LEFT JOIN projects p ON c.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      
      ORDER BY date DESC
      LIMIT 10
    `, params);

    // Proyectos por estado
    const [projectsByStatus] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM projects p
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
      GROUP BY status
    `, params);

    // Tareas por prioridad
    const [tasksByPriority] = await pool.execute(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM tasks t
      LEFT JOIN zones z ON t.zone_id = z.id
      LEFT JOIN projects p ON z.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
      GROUP BY priority
    `, params);

    const stats = {
      projects: projectsStats[0],
      tasks: tasksStats[0],
      clients: clientsCount[0],
      users: usersStats,
      recentActivity,
      projectsByStatus,
      tasksByPriority
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas'
    });
  }
}

// Obtener actividad reciente extendida
async function getRecentActivity(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 20, type } = req.query;

    let whereClause = '';
    let params = [];

    if (userRole !== 'admin') {
      whereClause = 'AND pw.user_id = ?';
      params = [userId];
    }

    let typeFilter = '';
    if (type && type !== 'all') {
      typeFilter = `AND activity_type = ?`;
      params.push(type);
    }

    const [activity] = await pool.execute(`
      SELECT 
        activity_type,
        title,
        description,
        status,
        created_at,
        project_name,
        user_name
      FROM (
        SELECT 
          'task' as activity_type,
          t.name as title,
          CONCAT('Tarea ', t.status, ' - ', p.name) as description,
          t.status,
          t.updated_at as created_at,
          p.name as project_name,
          u.name as user_name
        FROM tasks t
        LEFT JOIN zones z ON t.zone_id = z.id
        LEFT JOIN projects p ON z.project_id = p.id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        LEFT JOIN users u ON t.updated_by = u.id
        ${whereClause}
        
        UNION ALL
        
        SELECT 
          'consulta' as activity_type,
          SUBSTRING(c.message, 1, 100) as title,
          CONCAT('Mensaje en ', p.name) as description,
          'created' as status,
          c.created_at as created_at,
          p.name as project_name,
          u.name as user_name
        FROM consultas c
        LEFT JOIN projects p ON c.project_id = p.id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        LEFT JOIN users u ON c.user_id = u.id
        ${whereClause}
        
        UNION ALL
        
        SELECT 
          'file' as activity_type,
          f.filename as title,
          CONCAT('Archivo subido a ', p.name) as description,
          'uploaded' as status,
          f.created_at as created_at,
          p.name as project_name,
          u.name as user_name
        FROM files f
        LEFT JOIN projects p ON f.project_id = p.id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        LEFT JOIN users u ON f.uploaded_by = u.id
        ${whereClause}
      ) as combined_activities
      ${typeFilter}
      ORDER BY created_at DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la actividad reciente'
    });
  }
}

// Obtener últimas notificaciones
async function getRecentNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const [notifications] = await pool.execute(`
      SELECT 
        id,
        type,
        message,
        read,
        created_at,
        project_id
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [userId, parseInt(limit)]);

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las notificaciones'
    });
  }
}

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getRecentNotifications
};
