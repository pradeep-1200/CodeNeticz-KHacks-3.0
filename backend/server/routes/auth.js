const express = require('express');
const router  = express.Router();

const authService = require('../src/modules/auth/auth.service');
const logger      = require('../src/utils/logger');

// ── Cookie options — cross-origin safe in production ──────────
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'strict',
  secure:   isProd,
  maxAge:   7 * 24 * 60 * 60 * 1000
};

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const meta   = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.login({ email, password }, meta);

    res.cookie('aclc_rt', result.refreshToken, COOKIE_OPTS);
    res.json({ success: true, user: result.user, token: result.accessToken });
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// ── POST /api/auth/register ────────────────────────────────────
// Legacy route — kept for backward compatibility.
// Registration now only creates the account; no tokens or cookies are issued.
// The client must redirect to /login to authenticate.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required' });
    }
    const result = await authService.register({ name, email, password });
    // Do NOT set cookies. Do NOT return tokens.
    res.status(201).json({ success: true, message: result.message });
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
  res.clearCookie('aclc_rt', { ...COOKIE_OPTS, maxAge: 0 });
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
