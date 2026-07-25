const authService = require('./auth.service');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure:   process.env.NODE_ENV === 'production',
  maxAge:   7 * 24 * 60 * 60 * 1000  // 7 days
};

async function register(req, res, next) {
  try {
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.register(req.body, meta);
    res.cookie('aclc_rt', result.refreshToken, COOKIE_OPTS);
    res.status(201).json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.login(req.body, meta);
    res.cookie('aclc_rt', result.refreshToken, COOKIE_OPTS);
    res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const raw = req.cookies?.aclc_rt;
    if (!raw) return res.status(401).json({ success: false, error: { code: 'NO_REFRESH', message: 'No refresh token' } });
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.refreshTokens(raw, meta);
    res.cookie('aclc_rt', result.refreshToken, COOKIE_OPTS);
    res.json({ success: true, data: { accessToken: result.accessToken } });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const raw = req.cookies?.aclc_rt;
    await authService.logout(raw);
    res.clearCookie('aclc_rt');
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) { next(err); }
}

async function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

module.exports = { register, login, refresh, logout, me };
