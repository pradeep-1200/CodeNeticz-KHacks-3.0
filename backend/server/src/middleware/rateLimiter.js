const rateLimit = require('express-rate-limit');

// ── General API Rate Limiter ─────────────────────────────────────
// Protects general application endpoints from automated abuse while
// providing high capacity (1000 requests per 15 mins per IP) for React SPA navigation.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } }
});

// ── Auth Route Rate Limiter ──────────────────────────────────────
// Strictly rate-limits login/registration attempts (10 requests per 15 mins per IP)
// to prevent credential stuffing and brute-force attacks.

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts, please try again later' } }
});

module.exports = { globalLimiter, authLimiter };
