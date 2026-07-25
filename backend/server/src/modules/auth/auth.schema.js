const { z } = require('zod');

// Password validation: minimum 6 characters for user convenience
const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(50, 'Password must not exceed 50 characters');

const RegisterSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email:    z.string().email('Please enter a valid institution email address').max(255).toLowerCase().trim(),
  password: passwordSchema
});

const LoginSchema = z.object({
  email:    z.string().email('Please enter a valid email address').max(255).toLowerCase().trim(),
  password: z.string().min(1, 'Password is required').max(50)
});

module.exports = { RegisterSchema, LoginSchema };
