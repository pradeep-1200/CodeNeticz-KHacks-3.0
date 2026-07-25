// P1 FIX: Legacy auth routes — now use real Argon2 hashing + real JWT
// These routes exist alongside /api/v1/auth for backward compatibility
// They delegate to auth.service.js for the actual business logic
const express = require('express');
const router  = express.Router();

const authService = require('../src/modules/auth/auth.service');
const logger      = require('../src/utils/logger');

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const meta   = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.login({ email, password }, meta);

    // Set httpOnly refresh token cookie
    res.cookie('aclc_rt', result.refreshToken, {
      httpOnly: true, sameSite: 'strict',
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: result.user, token: result.accessToken });
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// ── POST /api/auth/register ────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    }
    const meta   = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.register({ name, email, password }, meta);

    res.cookie('aclc_rt', result.refreshToken, {
      httpOnly: true, sameSite: 'strict',
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ success: true, user: result.user, token: result.accessToken });
  } catch (err) {
    if (err.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────
router.post('/logout', async (req, res) => {
  const raw = req.cookies?.aclc_rt;
  await authService.logout(raw).catch(() => {});
  res.clearCookie('aclc_rt');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
