const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const parsed = schema.parse(dataToValidate);
      if (source === 'body') req.body = parsed;
      else if (source === 'query') req.query = parsed;
      else if (source === 'params') req.params = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          message: formattedErrors[0]?.message || 'Validation failed',
          errors: formattedErrors,
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
};

module.exports = {
  validate,
  objectIdSchema,
};

