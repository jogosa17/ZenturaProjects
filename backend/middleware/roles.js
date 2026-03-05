// Middleware para verificar roles de usuario
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Acceso denegado. Usuario no autenticado.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Acceso denegado. Permisos insuficientes.' 
      });
    }

    next();
  };
}

// Middleware específicos para cada rol
const requireAdmin = requireRole(['admin']);
const requireWorker = requireRole(['admin', 'worker']);

module.exports = {
  requireRole,
  requireAdmin,
  requireWorker
};
