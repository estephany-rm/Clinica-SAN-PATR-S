const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, message: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ success: false, data: null, message: 'No tienes permiso para esta acción' });
    }
    next();
  };
};

module.exports = checkRole;