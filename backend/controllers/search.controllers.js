const { pool } = require('../config/database');

// Búsqueda global
async function globalSearch(req, res) {
  try {
    const { q, type, limit = 20 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    let whereClause = '';
    let params = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (userRole !== 'admin') {
      whereClause = 'AND pw.user_id = ?';
      params.push(userId);
    }

    let results = [];

    // Buscar proyectos
    if (!type || type === 'projects') {
      const [projects] = await pool.execute(`
        SELECT 
          'project' as type,
          p.id,
          p.name as title,
          p.description,
          p.status,
          p.priority,
          c.name as client_name,
          p.start_date,
          p.end_date,
          CONCAT('/projects/', p.id) as url
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        WHERE (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
        ${whereClause}
        ORDER BY p.name
        LIMIT ?
      `, [...params, parseInt(limit)]);

      results.push(...projects);
    }

    // Buscar tareas
    if (!type || type === 'tasks') {
      const [tasks] = await pool.execute(`
        SELECT 
          'task' as type,
          t.id,
          t.name as title,
          t.description,
          t.status,
          t.priority,
          t.price,
          p.name as project_name,
          z.name as zone_name,
          CONCAT('/projects/', p.id, '#tasks') as url
        FROM tasks t
        LEFT JOIN zones z ON t.zone_id = z.id
        LEFT JOIN projects p ON z.project_id = p.id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        WHERE (t.name LIKE ? OR t.description LIKE ?)
        ${whereClause}
        ORDER BY t.name
        LIMIT ?
      `, [...params, parseInt(limit)]);

      results.push(...tasks);
    }

    // Buscar clientes
    if (!type || type === 'clients') {
      const [clients] = await pool.execute(`
        SELECT 
          'client' as type,
          c.id,
          c.name as title,
          c.phone,
          COUNT(p.id) as project_count,
          CONCAT('/clients') as url
        FROM clients c
        LEFT JOIN projects p ON c.id = p.client_id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        WHERE c.name LIKE ? OR c.phone LIKE ?
        ${whereClause}
        GROUP BY c.id, c.name, c.phone
        ORDER BY c.name
        LIMIT ?
      `, [searchTerm, searchTerm, ...(userRole !== 'admin' ? [userId] : []), parseInt(limit)]);

      results.push(...clients);
    }

    // Buscar zonas
    if (!type || type === 'zones') {
      const [zones] = await pool.execute(`
        SELECT 
          'zone' as type,
          z.id,
          z.name as title,
          p.name as project_name,
          COUNT(t.id) as task_count,
          CONCAT('/projects/', p.id, '#zones') as url
        FROM zones z
        LEFT JOIN projects p ON z.project_id = p.id
        LEFT JOIN tasks t ON z.id = t.zone_id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        WHERE z.name LIKE ?
        ${whereClause}
        GROUP BY z.id, z.name, p.name
        ORDER BY z.name
        LIMIT ?
      `, [...params, parseInt(limit)]);

      results.push(...zones);
    }

    // Buscar archivos
    if (!type || type === 'files') {
      const [files] = await pool.execute(`
        SELECT 
          'file' as type,
          f.id,
          f.filename as title,
          f.original_name,
          f.file_size,
          f.mime_type,
          f.created_at,
          p.name as project_name,
          CONCAT('/uploads/', f.filename) as url
        FROM files f
        LEFT JOIN projects p ON f.project_id = p.id
        LEFT JOIN project_workers pw ON p.id = pw.project_id
        WHERE (f.filename LIKE ? OR f.original_name LIKE ?)
        ${whereClause}
        ORDER BY f.created_at DESC
        LIMIT ?
      `, [...params, parseInt(limit)]);

      results.push(...files);
    }

    // Buscar usuarios (solo admin)
    if (userRole === 'admin' && (!type || type === 'users')) {
      const [users] = await pool.execute(`
        SELECT 
          'user' as type,
          u.id,
          u.name as title,
          u.email,
          u.role,
          u.status,
          COUNT(pw.project_id) as project_count,
          CONCAT('/users') as url
        FROM users u
        LEFT JOIN project_workers pw ON u.id = pw.user_id
        WHERE (u.name LIKE ? OR u.email LIKE ?)
        GROUP BY u.id, u.name, u.email, u.role, u.status
        ORDER BY u.name
        LIMIT ?
      `, [searchTerm, searchTerm, parseInt(limit)]);

      results.push(...users);
    }

    // Ordenar resultados por relevancia (prioridad de tipo)
    const typePriority = {
      'project': 1,
      'task': 2,
      'client': 3,
      'zone': 4,
      'file': 5,
      'user': 6
    };

    results.sort((a, b) => {
      const priorityDiff = typePriority[a.type] - typePriority[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });

    res.json({
      success: true,
      data: {
        query: q,
        results: results.slice(0, parseInt(limit)),
        total: results.length
      }
    });

  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la búsqueda'
    });
  }
}

// Búsqueda rápida (autocomplete)
async function quickSearch(req, res) {
  try {
    const { q, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = `%${q.trim()}%`;
    let whereClause = '';
    let params = [searchTerm, searchTerm];

    if (userRole !== 'admin') {
      whereClause = 'AND pw.user_id = ?';
      params.push(userId);
    }

    // Búsqueda rápida de proyectos y tareas
    const [quickResults] = await pool.execute(`
      SELECT 
        'project' as type,
        p.id,
        p.name as title,
        c.name as subtitle,
        CONCAT('/projects/', p.id) as url
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      WHERE p.name LIKE ?
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'task' as type,
        t.id,
        t.name as title,
        p.name as subtitle,
        CONCAT('/projects/', p.id, '#tasks') as url
      FROM tasks t
      LEFT JOIN zones z ON t.zone_id = z.id
      LEFT JOIN projects p ON z.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      WHERE t.name LIKE ?
      ${whereClause}
      
      ORDER BY title
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      data: quickResults
    });

  } catch (error) {
    console.error('Error en búsqueda rápida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la búsqueda rápida'
    });
  }
}

// Estadísticas de búsqueda
async function getSearchStats(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = '';
    let params = [];

    if (userRole !== 'admin') {
      whereClause = 'WHERE pw.user_id = ?';
      params = [userId];
    }

    const [stats] = await pool.execute(`
      SELECT 
        'projects' as entity,
        COUNT(*) as count
      FROM projects p
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'tasks' as entity,
        COUNT(*) as count
      FROM tasks t
      LEFT JOIN zones z ON t.zone_id = z.id
      LEFT JOIN projects p ON z.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'clients' as entity,
        COUNT(DISTINCT p.client_id) as count
      FROM projects p
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'zones' as entity,
        COUNT(*) as count
      FROM zones z
      LEFT JOIN projects p ON z.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'files' as entity,
        COUNT(*) as count
      FROM files f
      LEFT JOIN projects p ON f.project_id = p.id
      LEFT JOIN project_workers pw ON p.id = pw.project_id
      ${whereClause}
    `, params);

    // Agregar estadísticas de usuarios si es admin
    if (userRole === 'admin') {
      const [userStats] = await pool.execute(`
        SELECT 
          'users' as entity,
          COUNT(*) as count
        FROM users
      `);
      stats.push(...userStats);
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
}

module.exports = {
  globalSearch,
  quickSearch,
  getSearchStats
};
