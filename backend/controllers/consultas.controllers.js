const { pool } = require('../config/database');
const { createNotification } = require('../utils/notification.utils');

// Crear una nueva consulta (hilo de chat)
const createConsulta = async (req, res) => {
  try {
    const { project_id, message } = req.body;
    const user_id = req.user.id;

    if (!project_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'El proyecto y el mensaje son obligatorios'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO consultas (project_id, user_id, message) VALUES (?, ?, ?)',
      [project_id, user_id, message]
    );

    // Obtener la consulta creada con info del usuario
    const [newConsulta] = await pool.execute(`
      SELECT c.*, u.name as user_name, u.role as user_role
      FROM consultas c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    // Notificar a admins
    await createNotification({
      projectId: project_id,
      type: 'message_received',
      message: `Nueva consulta en proyecto: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      toAdmin: true,
      excludeUserId: user_id
    });

    res.status(201).json({
      success: true,
      message: 'Consulta creada exitosamente',
      data: newConsulta[0]
    });
  } catch (error) {
    console.error('Error al crear consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la consulta'
    });
  }
};

// Obtener consultas de un proyecto
const getConsultasByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Obtener consultas principales
    const [consultas] = await pool.execute(`
      SELECT c.*, u.name as user_name, u.role as user_role,
      (SELECT COUNT(*) FROM consultas_replies WHERE consulta_id = c.id) as reply_count
      FROM consultas c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = ?
      ORDER BY c.created_at DESC
    `, [projectId]);

    // Para cada consulta, obtener las respuestas (o cargarlas bajo demanda en frontend)
    // Aquí vamos a cargar las respuestas para simplificar, o podríamos hacer otro endpoint.
    // Carguemos las respuestas aquí para tener todo el hilo.
    
    for (let consulta of consultas) {
      const [replies] = await pool.execute(`
        SELECT r.*, u.name as user_name, u.role as user_role
        FROM consultas_replies r
        JOIN users u ON r.user_id = u.id
        WHERE r.consulta_id = ?
        ORDER BY r.created_at ASC
      `, [consulta.id]);
      consulta.replies = replies;
    }

    res.json({
      success: true,
      data: consultas
    });
  } catch (error) {
    console.error('Error al obtener consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las consultas del proyecto'
    });
  }
};

// Responder a una consulta
const replyConsulta = async (req, res) => {
  try {
    const { consulta_id } = req.params;
    const { message, reply_to_id } = req.body;
    const user_id = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje de respuesta es obligatorio'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO consultas_replies (consulta_id, user_id, message, reply_to_id) VALUES (?, ?, ?, ?)',
      [consulta_id, user_id, message, reply_to_id || null]
    );

    // Obtener la respuesta creada
    const [newReply] = await pool.execute(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM consultas_replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [result.insertId]);

    // Actualizar timestamp de la consulta principal para que suba en la lista si se ordena por updated_at
    await pool.execute('UPDATE consultas SET updated_at = NOW() WHERE id = ?', [consulta_id]);

    // Obtener info de la consulta para notificar
    const [consultaInfo] = await pool.execute('SELECT user_id, project_id FROM consultas WHERE id = ?', [consulta_id]);
    
    if (consultaInfo.length > 0) {
      const originalAuthorId = consultaInfo[0].user_id;
      const projectId = consultaInfo[0].project_id;

      // Si responde un admin, notificar al usuario autor de la consulta
      if (req.user.role === 'admin' && originalAuthorId !== user_id) {
        await createNotification({
          userId: originalAuthorId,
          projectId: projectId,
          type: 'message_reply',
          message: `Nueva respuesta en tu consulta: ${message.substring(0, 50)}...`,
          excludeUserId: user_id
        });
      } else {
        // Si responde el usuario, notificar a admins
        await createNotification({
          projectId: projectId,
          type: 'message_reply',
          message: `Nueva respuesta en consulta: ${message.substring(0, 50)}...`,
          toAdmin: true,
          excludeUserId: user_id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Respuesta enviada exitosamente',
      data: newReply[0]
    });
  } catch (error) {
    console.error('Error al responder consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la respuesta'
    });
  }
};

// Eliminar consulta (solo admin o autor)
const deleteConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [consultas] = await pool.execute('SELECT * FROM consultas WHERE id = ?', [id]);

    if (consultas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consulta no encontrada'
      });
    }

    const consulta = consultas[0];

    if (consulta.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta consulta'
      });
    }

    await pool.execute('DELETE FROM consultas WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la consulta'
    });
  }
};

// Eliminar respuesta
const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [replies] = await pool.execute('SELECT * FROM consultas_replies WHERE id = ?', [id]);

    if (replies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Respuesta no encontrada'
      });
    }

    const reply = replies[0];

    if (reply.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta respuesta'
      });
    }

    await pool.execute('DELETE FROM consultas_replies WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Respuesta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar respuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la respuesta'
    });
  }
};

module.exports = {
  createConsulta,
  getConsultasByProject,
  replyConsulta,
  deleteConsulta,
  deleteReply
};
