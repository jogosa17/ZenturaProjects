const { pool } = require('../config/database');
const { hashPassword } = require('../utils/auth.utils');

// Crear un nuevo trabajador
const createWorker = async (req, res) => {
  try {
    const { name, email, password, dni, username } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Verificar si el usuario ya existe por email
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el username ya existe (si se proporciona)
    if (username) {
      const [existingUsernames] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUsernames.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya está registrado'
        });
      }
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password);

    // Insertar usuario con los nuevos campos
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, status, dni, username) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'worker', 1, dni || null, username || null]
    );

    res.status(201).json({
      success: true,
      message: 'Trabajador creado exitosamente',
      data: {
        id: result.insertId,
        name,
        email,
        role: 'worker',
        status: 1,
        dni: dni || null,
        username: username || null
      }
    });
  } catch (error) {
    console.error('Error al crear trabajador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el trabajador'
    });
  }
};

// Crear un nuevo administrador
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, dni, username } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Verificar si el usuario ya existe por email
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el username ya existe (si se proporciona)
    if (username) {
      const [existingUsernames] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUsernames.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya está registrado'
        });
      }
    }

    const hashedPassword = await hashPassword(password);

    // Insertar administrador con los nuevos campos
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, status, dni, username) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin', 1, dni || null, username || null]
    );

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: {
        id: result.insertId,
        name,
        email,
        role: 'admin',
        status: 1,
        dni: dni || null,
        username: username || null
      }
    });
  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el administrador'
    });
  }
};

// Editar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Verificar si el usuario existe
    const [users] = await pool.execute('SELECT id, password FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email) {
      const [existingEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado por otro usuario'
        });
      }
    }

    let hashedPassword = users[0].password;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    await pool.execute(
      'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
      [name || users[0].name, email || users[0].email, hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario'
    });
  }
};

// Activar/Desactivar usuario
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que status sea 0 o 1
    if (![0, 1].includes(Number(status))) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser 1 (activado) o 0 (desactivado)'
      });
    }

    const [result] = await pool.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Usuario ${status === 1 ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario'
    });
  }
};

// Listar trabajadores
const getWorkers = async (req, res) => {
  try {
    // Consulta simplificada sin joins complejos
    const [workers] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.dni, u.username, u.status, u.created_at
      FROM users u
      WHERE u.role = 'worker'
      ORDER BY u.name ASC
    `);

    res.json({
      success: true,
      data: workers
    });

  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de trabajadores'
    });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los detalles del usuario'
    });
  }
};

module.exports = {
  createWorker,
  createAdmin,
  updateUser,
  toggleUserStatus,
  getWorkers,
  getUserById
};
