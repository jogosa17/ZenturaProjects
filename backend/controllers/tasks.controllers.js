const { pool } = require('../config/database');
const { createNotification, sendProjectChatMessage } = require('../utils/notification.utils');

// Crear una nueva tarea
const createTask = async (req, res) => {
  try {
    const { zone_id, name, description, price, priority, notes } = req.body;
    const currentUserId = req.user.id;

    if (!zone_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'La zona y el nombre de la tarea son obligatorios'
      });
    }

    // Obtener project_id de la zona
    const [zone] = await pool.execute('SELECT project_id, name as zone_name FROM zones WHERE id = ?', [zone_id]);
    
    if (zone.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La zona especificada no existe'
      });
    }

    const project_id = zone[0].project_id;
    const zone_name = zone[0].zone_name;

    const [result] = await pool.execute(
      `INSERT INTO tasks (
        zone_id, project_id, name, description, price, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        zone_id, 
        project_id, 
        name, 
        description || null, 
        price || 0.00, 
        priority || 0
      ]
    );

    // Crear notificación para administradores
    await createNotification({
      projectId: project_id,
      type: 'task_created',
      message: `Nueva tarea creada: "${name}" en zona "${zone_name}"`,
      toAdmin: true,
      excludeUserId: currentUserId
    });

    // Enviar mensaje automático al chat del proyecto
    await sendProjectChatMessage({
      projectId: project_id,
      message: `📝 **Nueva Tarea Creada**\n\n🔹 **Tarea:** ${name}\n🏗️ **Zona:** ${zone_name}\n💰 **Precio:** €${price || '0.00'}\n👤 **Creado por:** ${req.user.name || 'Usuario'}`,
      type: 'task_created',
      userId: currentUserId
    });

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: {
        id: result.insertId,
        zone_id,
        project_id,
        name,
        description,
        price: price || 0,
        priority: priority || 0,
        notes,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la tarea'
    });
  }
};

// Listar tareas por zona
const getTasksByZone = async (req, res) => {
  try {
    const { zoneId } = req.params;

    const [tasks] = await pool.execute(
      'SELECT * FROM tasks WHERE zone_id = ? ORDER BY created_at ASC',
      [zoneId]
    );

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas de la zona'
    });
  }
};

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, priority, status } = req.body;
    const currentUserId = req.user.id;

    // Obtener tarea actual para comparar y sacar project_id
    const [currentTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (currentTask.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    const task = currentTask[0];

    // Construir query dinámica
    let fields = [];
    let values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (price !== undefined) { fields.push('price = ?'); values.push(price); }
    if (priority !== undefined) { fields.push('priority = ?'); values.push(priority); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Notificar cambios importantes (estado o prioridad)
    if (status !== undefined && status !== task.status) {
      let statusText = '';
      switch(status) {
        case 0: statusText = 'Pendiente'; break;
        case 1: statusText = 'En curso'; break;
        case 2: statusText = 'Finalizada'; break;
      }
      
      await createNotification({
        projectId: task.project_id,
        type: 'task_updated',
        message: `La tarea "${task.name}" ha cambiado a estado: ${statusText}`,
        toAdmin: true,
        excludeUserId: currentUserId
      });

      // Enviar mensaje automático al chat del proyecto
      await sendProjectChatMessage({
        projectId: task.project_id,
        message: `🔄 **Tarea Actualizada**\n\n🔹 **Tarea:** ${task.name}\n📊 **Nuevo Estado:** ${statusText}\n👤 **Actualizado por:** ${req.user.name || 'Usuario'}`,
        type: 'task_updated',
        userId: currentUserId
      });
    }

    if (priority !== undefined && priority !== task.priority) {
      let priorityText = '';
      // Asumiendo que priority viene como número 0, 1, 2
      if (priority == 2) priorityText = 'Alta';
      else if (priority == 1) priorityText = 'Media';
      else priorityText = 'Baja';

      await createNotification({
        projectId: task.project_id,
        type: 'task_updated',
        message: `La prioridad de la tarea "${task.name}" ha cambiado a: ${priorityText}`,
        toAdmin: true,
        excludeUserId: currentUserId
      });

      // Enviar mensaje automático al chat del proyecto
      await sendProjectChatMessage({
        projectId: task.project_id,
        message: `⚡ **Prioridad Actualizada**\n\n🔹 **Tarea:** ${task.name}\n🎯 **Nueva Prioridad:** ${priorityText}\n👤 **Actualizado por:** ${req.user.name || 'Usuario'}`,
        type: 'task_updated',
        userId: currentUserId
      });
    }

    // Obtener tarea actualizada para devolverla
    const [updatedTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: updatedTask[0]
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la tarea'
    });
  }
};

// Eliminar tarea
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la tarea'
    });
  }
};

module.exports = {
  createTask,
  getTasksByZone,
  updateTask,
  deleteTask
};
