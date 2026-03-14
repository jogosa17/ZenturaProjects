const { pool } = require('../config/database');

// Obtener salas de chat para el usuario actual
async function getChatRooms(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        cr.id,
        cr.name,
        cr.type,
        cr.project_id,
        p.name as project_name,
        p.status as project_status,
        cp.role as user_role,
        cp.last_read_at,
        COUNT(DISTINCT cm.id) as total_messages,
        COUNT(DISTINCT CASE WHEN cm.created_at > COALESCE(cp.last_read_at, '1970-01-01') AND cm.user_id != ? THEN 1 END) as unread_count,
        MAX(cm.created_at) as last_message_time,
        (SELECT u.name FROM users u WHERE u.id = (SELECT cm2.user_id FROM chat_messages cm2 WHERE cm2.room_id = cr.id ORDER BY cm2.created_at DESC LIMIT 1)) as last_message_user,
        (SELECT cm3.message FROM chat_messages cm3 WHERE cm3.room_id = cr.id ORDER BY cm3.created_at DESC LIMIT 1) as last_message_content
      FROM chat_rooms cr
      JOIN chat_participants cp ON cr.id = cp.room_id
      LEFT JOIN projects p ON cr.project_id = p.id
      LEFT JOIN chat_messages cm ON cr.id = cm.room_id AND cm.is_deleted = FALSE
      WHERE cp.user_id = ? AND cp.is_active = TRUE AND cr.is_active = TRUE
      GROUP BY cr.id, cr.name, cr.type, cr.project_id, p.name, p.status, cp.role, cp.last_read_at
      ORDER BY last_message_time DESC NULLS LAST, cr.created_at DESC
    `;

    const [rooms] = await pool.execute(query, [userId, userId]);

    res.json({
      success: true,
      rooms: rooms.map(room => ({
        id: room.id,
        name: room.name,
        type: room.type,
        project: room.project_id ? {
          id: room.project_id,
          name: room.project_name,
          status: room.project_status
        } : null,
        userRole: room.userRole,
        unreadCount: parseInt(room.unread_count) || 0,
        totalMessages: parseInt(room.total_messages) || 0,
        lastMessageTime: room.last_message_time,
        lastMessageUser: room.last_message_user,
        lastMessageContent: room.last_message_content ? 
          (room.last_message_content.length > 50 ? 
            room.last_message_content.substring(0, 50) + '...' : 
            room.last_message_content) : null
      }))
    });

  } catch (error) {
    console.error('Error al obtener salas de chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener salas de chat'
    });
  }
}

// Obtener mensajes de una sala específica
async function getChatMessages(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verificar que el usuario tenga acceso a esta sala
    const [participantCheck] = await pool.execute(
      'SELECT id FROM chat_participants WHERE room_id = ? AND user_id = ? AND is_active = TRUE',
      [roomId, userId]
    );

    if (participantCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sala de chat'
      });
    }

    // Obtener mensajes
    const [messages] = await pool.execute(`
      SELECT 
        cm.id,
        cm.message,
        cm.message_type,
        cm.file_url,
        cm.reply_to_id,
        cm.is_edited,
        cm.edited_at,
        cm.created_at,
        u.id as user_id,
        u.name as user_name,
        u.role as user_role,
        reply_cm.message as reply_message,
        reply_u.name as reply_user_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN chat_messages reply_cm ON cm.reply_to_id = reply_cm.id
      LEFT JOIN users reply_u ON reply_cm.user_id = reply_u.id
      WHERE cm.room_id = ? AND cm.is_deleted = FALSE
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `, [roomId, parseInt(limit), offset]);

    // Obtener total de mensajes para paginación
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM chat_messages WHERE room_id = ? AND is_deleted = FALSE',
      [roomId]
    );

    res.json({
      success: true,
      messages: messages.reverse().map(msg => ({
        id: msg.id,
        message: msg.message,
        messageType: msg.message_type,
        fileUrl: msg.file_url,
        isEdited: msg.is_edited,
        editedAt: msg.edited_at,
        createdAt: msg.created_at,
        user: {
          id: msg.user_id,
          name: msg.user_name,
          role: msg.user_role
        },
        replyTo: msg.reply_to_id ? {
          id: msg.reply_to_id,
          message: msg.reply_message,
          user: msg.reply_user_name
        } : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
}

// Enviar un mensaje
async function sendMessage(req, res) {
  try {
    const { roomId } = req.params;
    const { message, messageType = 'text', replyToId } = req.body;
    const userId = req.user.id;

    // Validar acceso a la sala
    const [participantCheck] = await pool.execute(
      'SELECT id FROM chat_participants WHERE room_id = ? AND user_id = ? AND is_active = TRUE',
      [roomId, userId]
    );

    if (participantCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sala de chat'
      });
    }

    // Insertar mensaje
    const [result] = await pool.execute(`
      INSERT INTO chat_messages (room_id, user_id, message, message_type, reply_to_id)
      VALUES (?, ?, ?, ?, ?)
    `, [roomId, userId, message, messageType, replyToId || null]);

    const messageId = result.insertId;

    // Crear notificaciones para otros participantes
    const [participants] = await pool.execute(
      'SELECT user_id FROM chat_participants WHERE room_id = ? AND user_id != ? AND is_active = TRUE',
      [roomId, userId]
    );

    for (const participant of participants) {
      await pool.execute(
        'INSERT INTO chat_notifications (user_id, room_id, message_id, type) VALUES (?, ?, ?, ?)',
        [participant.user_id, roomId, messageId, 'new_message']
      );
    }

    // Obtener el mensaje completo para respuesta
    const [newMessage] = await pool.execute(`
      SELECT 
        cm.id,
        cm.message,
        cm.message_type,
        cm.file_url,
        cm.reply_to_id,
        cm.created_at,
        u.id as user_id,
        u.name as user_name,
        u.role as user_role
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `, [messageId]);

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: newMessage[0]
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje'
    });
  }
}

// Marcar mensajes como leídos
async function markAsRead(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Actualizar última lectura
    await pool.execute(
      'UPDATE chat_participants SET last_read_at = CURRENT_TIMESTAMP WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );

    // Marcar notificaciones como leídas
    await pool.execute(
      'UPDATE chat_notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND room_id = ? AND is_read = FALSE',
      [userId, roomId]
    );

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });

  } catch (error) {
    console.error('Error al marcar como leído:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes como leídos'
    });
  }
}

// Obtener notificaciones no leídas
async function getUnreadNotifications(req, res) {
  try {
    const userId = req.user.id;

    const [notifications] = await pool.execute(`
      SELECT 
        cn.id,
        cn.type,
        cn.created_at,
        cr.name as room_name,
        cr.project_id,
        p.name as project_name,
        cm.message,
        u.name as sender_name
      FROM chat_notifications cn
      JOIN chat_rooms cr ON cn.room_id = cr.id
      JOIN chat_messages cm ON cn.message_id = cm.id
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN projects p ON cr.project_id = p.id
      WHERE cn.user_id = ? AND cn.is_read = FALSE
      ORDER BY cn.created_at DESC
      LIMIT 50
    `, [userId]);

    res.json({
      success: true,
      notifications: notifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        createdAt: notif.created_at,
        room: {
          name: notif.room_name,
          project: notif.project_id ? {
            id: notif.project_id,
            name: notif.project_name
          } : null
        },
        message: notif.message,
        sender: notif.sender_name
      })),
      unreadCount: notifications.length
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
}

module.exports = {
  getChatRooms,
  getChatMessages,
  sendMessage,
  markAsRead,
  getUnreadNotifications
};
