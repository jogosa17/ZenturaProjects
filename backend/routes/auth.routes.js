const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyPassword, generateToken } = require('../utils/auth.utils');

// Endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'El email y la contraseña son obligatorios'
      });
    }

    // Buscar usuario en la base de datos
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar si el usuario está activo
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador.'
      });
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Responder con token y datos del usuario (sin contraseña)
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint de validación de token
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const { verifyToken } = require('../utils/auth.utils');
    const decoded = verifyToken(token);

    // Obtener datos actualizados del usuario
    const [users] = await pool.execute(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Error en validación de token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});

module.exports = router;
module.exports = router;
