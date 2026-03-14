const { pool } = require('../config/database');

// Obtener trabajadores disponibles para asignar a un proyecto
async function getAvailableWorkers(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Solo admins pueden ver workers disponibles
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden gestionar asignaciones'
      });
    }

    // Obtener todos los workers activos
    const [allWorkers] = await pool.execute(
      'SELECT id, name, email, username FROM users WHERE role = "worker" AND status = 1 ORDER BY name'
    );

    // Obtener workers ya asignados a este proyecto
    const [assignedWorkers] = await pool.execute(
      'SELECT worker_id FROM project_workers WHERE project_id = ?',
      [projectId]
    );

    const assignedIds = assignedWorkers.map(w => w.worker_id);

    // Separar disponibles y asignados
    const available = allWorkers.filter(w => !assignedIds.includes(w.id));
    const assigned = allWorkers.filter(w => assignedIds.includes(w.id));

    res.json({
      success: true,
      data: {
        available,
        assigned
      }
    });

  } catch (error) {
    console.error('Error obteniendo workers disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener trabajadores disponibles'
    });
  }
}

// Asignar worker a proyecto
async function assignWorkerToProject(req, res) {
  try {
    const { projectId } = req.params;
    const { workerId } = req.params;  // Corregido: obtener de params, no de body
    const userId = req.user.id;
    const userRole = req.user.role;

    // Solo admins pueden asignar workers
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden asignar trabajadores'
      });
    }

    // Verificar que el worker exista y esté activo
    const [workerCheck] = await pool.execute(
      'SELECT id, name FROM users WHERE id = ? AND role = "worker" AND status = 1',
      [workerId]
    );

    if (workerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado o inactivo'
      });
    }

    // Verificar que el proyecto exista
    const [projectCheck] = await pool.execute(
      'SELECT id, name FROM projects WHERE id = ?',
      [projectId]
    );

    if (projectCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar si ya está asignado
    const [existingAssignment] = await pool.execute(
      'SELECT project_id, worker_id FROM project_workers WHERE project_id = ? AND worker_id = ?',
      [projectId, workerId]
    );

    if (existingAssignment.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El trabajador ya está asignado a este proyecto'
      });
    }

    // Realizar asignación
    await pool.execute(
      'INSERT INTO project_workers (project_id, worker_id) VALUES (?, ?)',
      [projectId, workerId]
    );

    // Agregar worker a la sala de chat del proyecto
    const [chatRoom] = await pool.execute(
      'SELECT id FROM chat_rooms WHERE project_id = ? AND type = "project"',
      [projectId]
    );

    if (chatRoom.length > 0) {
      await pool.execute(
        'INSERT INTO chat_participants (room_id, user_id, role) VALUES (?, ?, "participant")',
        [chatRoom[0].id, workerId]
      );
    }

    res.json({
      success: true,
      message: `Trabajador ${workerCheck[0].name} asignado al proyecto ${projectCheck[0].name}`,
      data: {
        worker: workerCheck[0],
        project: projectCheck[0]
      }
    });

  } catch (error) {
    console.error('Error asignando worker a proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar trabajador al proyecto'
    });
  }
}

// Desasignar worker de proyecto
async function unassignWorkerFromProject(req, res) {
  try {
    const { projectId, workerId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Solo admins pueden desasignar workers
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden desasignar trabajadores'
      });
    }

    // Verificar que la asignación exista
    const [assignment] = await pool.execute(
      'SELECT u.name as worker_name, p.name as project_name FROM project_workers pw JOIN users u ON pw.worker_id = u.id JOIN projects p ON pw.project_id = p.id WHERE pw.project_id = ? AND pw.worker_id = ?',
      [projectId, workerId]
    );

    if (assignment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      });
    }

    // Eliminar asignación
    await pool.execute(
      'DELETE FROM project_workers WHERE project_id = ? AND worker_id = ?',
      [projectId, workerId]
    );

    // Eliminar worker de la sala de chat del proyecto
    const [chatRoom] = await pool.execute(
      'SELECT id FROM chat_rooms WHERE project_id = ? AND type = "project"',
      [projectId]
    );

    if (chatRoom.length > 0) {
      await pool.execute(
        'DELETE FROM chat_participants WHERE room_id = ? AND user_id = ?',
        [chatRoom[0].id, workerId]
      );
    }

    res.json({
      success: true,
      message: `Trabajador ${assignment[0].worker_name} desasignado del proyecto ${assignment[0].project_name}`
    });

  } catch (error) {
    console.error('Error desasignando worker del proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desasignar trabajador del proyecto'
    });
  }
}

// Obtener asignaciones de un proyecto
async function getProjectAssignments(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Solo admins pueden ver asignaciones
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver asignaciones'
      });
    }

    // Obtener workers asignados al proyecto
    const [assignedWorkers] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.username, pw.assigned_at
      FROM project_workers pw
      JOIN users u ON pw.worker_id = u.id
      WHERE pw.project_id = ?
      ORDER BY u.name
    `, [projectId]);

    res.json({
      success: true,
      data: assignedWorkers
    });

  } catch (error) {
    console.error('Error obteniendo asignaciones del proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones del proyecto'
    });
  }
}

module.exports = {
  getAvailableWorkers,
  assignWorkerToProject,
  unassignWorkerFromProject,
  getProjectAssignments
};
