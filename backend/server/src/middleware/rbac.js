/**
 * Role-Based Access Control middleware factory.
 * Usage: rbac('TEACHER'), rbac('ADMIN'), rbac('STUDENT', 'TEACHER')
 * Must be used AFTER authenticate middleware.
 */
function rbac(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'Authentication required' } });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
}

module.exports = { rbac };
