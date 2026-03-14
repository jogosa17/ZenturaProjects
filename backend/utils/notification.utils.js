const { pool } = require('../config/database');

/**
 * Envía un mensaje automático al chat del proyecto cuando hay cambios en tareas o notas
 * @param {number} projectId - ID del proyecto
 * @param {string} message - Mensaje a enviar al chat
 * @param {string} type - Tipo de mensaje (task_created, task_updated, note_created, etc.)
 * @param {number} userId - ID del usuario que realiza la acción (para excluirlo de某些 notificaciones)
 */
const sendProjectChatMessage = async ({ projectId, message, type, userId }) => {
  try {
    // Obtener la sala de chat del proyecto
    const [chatRoom] = await pool.execute(
      'SELECT id FROM chat_rooms WHERE project_id = ? AND type = "project"',
      [projectId]
    );

    if (chatRoom.length === 0) {
      console.log(`No hay sala de chat para el proyecto ${projectId}`);
      return;
    }

    const roomId = chatRoom[0].id;

    // Insertar mensaje automático en el chat
    await pool.execute(`
      INSERT INTO chat_messages (room_id, user_id, message, message_type, created_at)
      VALUES (?, ?, ?, 'system', NOW())
    `, [roomId, userId, message]);

    console.log(`Mensaje automático enviado al chat del proyecto ${projectId}: ${message}`);
  } catch (error) {
    console.error('Error al enviar mensaje automático al chat:', error);
  }
};

/**
 * Crea una notificación para un usuario específico o un grupo de usuarios.
 * @param {Object} params - Parámetros de la notificación
 * @param {number} params.userId - ID del usuario que recibe la notificación (opcional si es para admin)
 * @param {number} params.projectId - ID del proyecto asociado (opcional)
 * @param {string} params.type - Tipo de notificación (task_created, task_updated, file_uploaded, message_received, etc.)
 * @param {string} params.message - Mensaje de la notificación
 * @param {boolean} params.toAdmin - Si es true, notifica a todos los admins
 * @param {Array<number>} params.excludeUserId - ID de usuario a excluir (ej. el que genera la acción)
 */
const createNotification = async ({ userId, projectId, type, message, toAdmin = false, excludeUserId = null }) => {
  try {
    const recipients = [];

    // Si es para un usuario específico
    if (userId && userId !== excludeUserId) {
      recipients.push(userId);
    }

    // Si es para administradores
    if (toAdmin) {
      const [admins] = await pool.execute('SELECT id FROM users WHERE role = ?', ['admin']);
      admins.forEach(admin => {
        if (admin.id !== excludeUserId && !recipients.includes(admin.id)) {
          recipients.push(admin.id);
        }
      });
    }

    // Insertar notificaciones
    if (recipients.length > 0) {
      const values = recipients.map(uid => [uid, projectId || null, type, message, false]);
      
      // Construir query para inserción múltiple
      // Nota: mysql2 no soporta inserción masiva directa con array de arrays en execute, 
      // pero podemos usar query con placeholders
      
      const placeholders = recipients.map(() => '(?, ?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();

      await pool.execute(
        `INSERT INTO notifications (user_id, project_id, type, message, is_read) VALUES ${placeholders}`,
        flatValues
      );
      
      console.log(`Notificación creada para ${recipients.length} usuarios. Tipo: ${type}`);
    }
  } catch (error) {
    console.error('Error al crear notificación:', error);
    // No lanzamos error para no interrumpir el flujo principal
  }
};

module.exports = {
  createNotification,
  sendProjectChatMessage
};
