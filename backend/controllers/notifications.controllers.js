const { pool } = require('../config/database');

// Obtener notificaciones del usuario actual
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    let query = `
      SELECT n.*, p.name as project_name 
      FROM notifications n
      LEFT JOIN projects p ON n.project_id = p.id
      WHERE n.user_id = ?
    `;
    
    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND n.is_read = 0';
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    const [notifications] = await pool.execute(query, params);

    // Enriquecer notificaciones con datos adicionales para redirección
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        let enrichedNotif = { ...notif };
        
        // Si es una notificación de tarea, obtener detalles de la tarea
        if (notif.type === 'task_created' || notif.type === 'task_updated') {
          try {
            // Extraer ID de tarea del mensaje
            const taskMatch = notif.message.match(/tarea.*?["']([^"']+)["']/i);
            if (taskMatch) {
              const taskName = taskMatch[1];
              const [taskInfo] = await pool.execute(
                'SELECT id, zone_id FROM tasks WHERE name = ? AND project_id = ? LIMIT 1',
                [taskName, notif.project_id]
              );
              if (taskInfo.length > 0) {
                enrichedNotif.task_id = taskInfo[0].id;
                enrichedNotif.zone_id = taskInfo[0].zone_id;
              }
            }
          } catch (error) {
            console.error('Error al obtener datos de tarea:', error);
          }
        }
        
        // Si es una notificación de nota, obtener detalles de la nota
        if (notif.type === 'note_created') {
          try {
            // Extraer ID de tarea del mensaje
            const taskMatch = notif.message.match(/tarea id[:\s]*(\d+)/i);
            if (taskMatch) {
              const taskId = parseInt(taskMatch[1]);
              const [taskInfo] = await pool.execute(
                'SELECT id, zone_id FROM tasks WHERE id = ? AND project_id = ? LIMIT 1',
                [taskId, notif.project_id]
              );
              if (taskInfo.length > 0) {
                enrichedNotif.task_id = taskInfo[0].id;
                enrichedNotif.zone_id = taskInfo[0].zone_id;
              }
            }
          } catch (error) {
            console.error('Error al obtener datos de nota:', error);
          }
        }
        
        return enrichedNotif;
      })
    );

    // Contar no leídas totales
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      success: true,
      data: enrichedNotifications,
      unreadCount: countResult[0].count
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada o no pertenece al usuario'
      });
    }

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notificación'
    });
  }
};

// Marcar todas como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al actualizar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notificaciones'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
