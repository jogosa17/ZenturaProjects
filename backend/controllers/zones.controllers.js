const { pool } = require('../config/database');

// Crear una nueva zona
const createZone = async (req, res) => {
  try {
    const { project_id, name } = req.body;

    if (!project_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'El ID del proyecto y el nombre de la zona son obligatorios'
      });
    }

    // Verificar que el proyecto existe
    const [project] = await pool.execute('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (project.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El proyecto especificado no existe'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO zones (project_id, name) VALUES (?, ?)',
      [project_id, name]
    );

    res.status(201).json({
      success: true,
      message: 'Zona creada exitosamente',
      data: {
        id: result.insertId,
        project_id,
        name
      }
    });
  } catch (error) {
    console.error('Error al crear zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la zona'
    });
  }
};

// Listar zonas por proyecto
const getZonesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [zones] = await pool.execute(
      'SELECT * FROM zones WHERE project_id = ? ORDER BY created_at ASC',
      [projectId]
    );

    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las zonas del proyecto'
    });
  }
};

// Actualizar zona
const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la zona es obligatorio'
      });
    }

    const [result] = await pool.execute(
      'UPDATE zones SET name = ? WHERE id = ?',
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Zona actualizada exitosamente',
      data: { id, name }
    });
  } catch (error) {
    console.error('Error al actualizar zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la zona'
    });
  }
};

// Eliminar zona
const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay tareas asociadas (cuando implementemos tareas)
    // Por ahora, asumimos que si hay tareas, la FK o la lógica impedirá borrar o hará cascade según definición
    // En la migración 05_create_zones_table.sql no hay FK a tasks, pero en tasks habrá FK a zones.
    // Si queremos proteger, deberíamos chequear tasks primero.
    // Dejaremos la validación de tareas para la fase de tareas o confiaremos en la restricción de BD si existe.

    const [result] = await pool.execute('DELETE FROM zones WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Zona no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Zona eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar zona:', error);
    // Capturar error de llave foránea si existen tareas
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la zona porque tiene tareas asociadas'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la zona'
    });
  }
};

module.exports = {
  createZone,
  getZonesByProject,
  updateZone,
  deleteZone
};
