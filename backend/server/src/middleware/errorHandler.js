const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  logger.error('Unhandled error', {
    category: 'system',
    code: err.code,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id
  });

  // In development mode, provide the exact error message to assist debugging
  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev || statusCode < 500
    ? err.message || 'An unexpected error occurred'
    : 'An internal error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message
    }
  });
}

module.exports = { errorHandler };
