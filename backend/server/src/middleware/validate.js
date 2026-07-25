const { ZodError } = require('zod');

/**
 * Zod schema validation middleware factory.
 * Validates req.body against the provided schema.
 * @param {import('zod').ZodSchema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError || err?.name === 'ZodError') {
        const rawIssues = err.issues || err.errors || [];
        const errors = rawIssues.map(e => ({
          field: (e.path || []).join('.'),
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errors[0]?.message || 'Invalid request data',
            details: errors
          }
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
