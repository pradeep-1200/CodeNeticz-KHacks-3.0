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
// Strictly rate-limits login/registration attempts to prevent credential
// stuffing and brute-force attacks.
//
// skipSuccessfulRequests: true — only failed attempts count toward the limit.
// This means a legitimate user who registers or logs in successfully does NOT
// consume a slot, preventing the case where a developer or tester exhausts
// the window with valid requests and then sees spurious "rate limited" errors.
// Failed attempts (wrong password, duplicate email) still count — exactly the
// traffic that needs to be throttled.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                     // 20 failed attempts per window per IP
  skipSuccessfulRequests: true, // successful 2xx responses do not count
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts, please try again later' } }
});

module.exports = { globalLimiter, authLimiter };
