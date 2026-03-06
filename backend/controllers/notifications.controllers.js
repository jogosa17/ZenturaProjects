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

    // Contar no leídas totales
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      success: true,
      data: notifications,
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
