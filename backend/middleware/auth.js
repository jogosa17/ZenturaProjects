const { verifyToken } = require('../utils/auth');

// Middleware para verificar autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Acceso denegado. Se requiere token de autenticación.' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido o expirado.' 
    });
  }
}

module.exports = { authenticateToken };
