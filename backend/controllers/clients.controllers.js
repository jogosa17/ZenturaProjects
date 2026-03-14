const { pool } = require('../config/database');

// Crear un nuevo cliente
const createClient = async (req, res) => {
  try {
    const { name, phone, dni_cif } = req.body;

    console.log('🔍 Backend recibiendo datos de creación:', { name, phone, dni_cif });

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y teléfono son obligatorios'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO clients (name, phone, dni_cif) VALUES (?, ?, ?)',
      [name, phone, dni_cif || null]
    );

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: {
        id: result.insertId,
        name,
        phone,
        dni_cif
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el cliente'
    });
  }
};

// Listar todos los clientes
const getClients = async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT c.*, 
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) as project_count
      FROM clients c 
      ORDER BY c.name ASC
    `);

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de clientes'
    });
  }
};

// Obtener cliente por ID con sus proyectos
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const [clients] = await pool.execute('SELECT * FROM clients WHERE id = ?', [id]);
    
    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Obtener proyectos del cliente
    const [projects] = await pool.execute(
      'SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    const client = clients[0];
    client.projects = projects;
    
    res.json({
      success: true,
      data: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        dni_cif: client.dni_cif,
        projects: client.projects
      }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los detalles del cliente'
    });
  }
};

// Actualizar cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, dni_cif } = req.body;

    console.log('🔍 Backend recibiendo datos de actualización:', { id, name, phone, dni_cif });

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y teléfono son obligatorios'
      });
    }

    const [result] = await pool.execute(
      'UPDATE clients SET name = ?, phone = ?, dni_cif = ? WHERE id = ?',
      [name, phone, dni_cif || null, id]
    );

    console.log('🔍 Resultado de la actualización:', { affectedRows: result.affectedRows });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: {
        id: parseInt(id),
        name,
        phone,
        dni_cif
      }
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el cliente'
    });
  }
};

// Eliminar cliente
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene proyectos asociados
    const [projects] = await pool.execute(
      'SELECT id FROM projects WHERE client_id = ? LIMIT 1',
      [id]
    );

    if (projects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el cliente porque tiene proyectos asociados'
      });
    }

    const [result] = await pool.execute('DELETE FROM clients WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el cliente'
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};
