const { z } = require('zod');

// FIX: aligned min(8) to match the frontend Register.jsx validation (was min(6))
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(30, 'Password must not exceed 30 characters');

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
