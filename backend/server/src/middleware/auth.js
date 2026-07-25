const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches { id, role, institutionId } to req.user on success.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'Authentication required' } });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, institutionId: decoded.institutionId };
    next();
  } catch (err) {
    logger.warn('Invalid token', { category: 'security', error: err.message, ip: req.ip });
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

module.exports = { authenticate };
