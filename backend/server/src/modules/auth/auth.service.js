// P1 FIX: Import canonical models instead of defining inline schemas
const User             = require('../../../models/User');
const RefreshToken     = require('../../../models/RefreshToken');
const mongoose         = require('mongoose');
const { hashPassword, verifyPassword }                 = require('../../utils/crypto');
const { generateAccessToken, generateRefreshToken, hashRefreshToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');

function ensureDatabaseAvailable() {
  if (mongoose.connection.readyState === 1) return;
  const err = new Error('Authentication service is temporarily unavailable');
  err.statusCode = 503;
  err.code = 'DATABASE_UNAVAILABLE';
  throw err;
}

// ── Role resolution from email domain ──────────────────────────
// Format: INSTITUTION_DOMAINS=staff.college.edu:TEACHER,student.college.edu:STUDENT
function resolveRoleFromDomain(email) {
  const domain = email.split('@')[1];
  if (!domain) throw new Error('Invalid email format');

  const domainConfig = process.env.INSTITUTION_DOMAINS || '';
  if (domainConfig) {
    const entries = domainConfig.split(',').map(e => e.trim().split(':'));
    for (const [d, role] of entries) {
      if (domain.toLowerCase() === d.toLowerCase()) return role;
    }
  }

  // Fallback — for generic demo/hackathon usage
  if (domain === 'staff.com' || domain.startsWith('staff.')) return 'TEACHER';
  if (domain === 'student.com' || domain.startsWith('student.')) return 'STUDENT';

  // Generic error — never reveal valid domains
  throw new Error('Email address is not recognized. Please use your institution email or contact your administrator.');
}

// ── Register ───────────────────────────────────────────────────
// Registration ONLY creates the account. No tokens are issued.
// The client must call /auth/login separately after registering.
async function register(data, meta = {}) {
  ensureDatabaseAvailable();
  const { name, email, password } = data;

  const role = resolveRoleFromDomain(email);

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409; err.code = 'EMAIL_EXISTS'; throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });

  logger.info('User registered', { category: 'auth', action: 'user.register', userId: user._id.toString(), role });

  // Return only user metadata — no access or refresh tokens.
  return {
    user: { id: user._id, name: user.name, email: user.email, role }
  };
}

// ── Login ──────────────────────────────────────────────────────
async function login(data, meta = {}) {
  ensureDatabaseAvailable();
  const { email, password } = data;

  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    logger.warn('Failed login — user not found', { category: 'security', email, ip: meta.ip });
    const err = new Error('Invalid email or password'); err.statusCode = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
  }

  // P1 FIX: verifyPassword uses Argon2 against passwordHash field
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    logger.warn('Failed login — wrong password', { category: 'security', userId: user._id.toString(), ip: meta.ip });
    const err = new Error('Invalid email or password'); err.statusCode = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
  }

  logger.info('User logged in', { category: 'auth', userId: user._id.toString(), role: user.role });

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role, institutionId: '' });
  const rt          = generateRefreshToken();
  await RefreshToken.create({
    userId: user._id, tokenHash: rt.hash, expiresAt: rt.expiresAt,
    ipAddress: meta.ip, userAgent: meta.userAgent
  });

  return {
    accessToken,
    refreshToken: rt.token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role,
            isPrelimsCompleted: user.isPrelimsCompleted, learningProfile: user.learningProfile }
  };
}

// ── Refresh Tokens ─────────────────────────────────────────────
async function refreshTokens(rawRefreshToken, meta = {}) {
  ensureDatabaseAvailable();
  const hash = hashRefreshToken(rawRefreshToken);
  const stored = await RefreshToken.findOne({
    tokenHash: hash, revokedAt: null, expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!stored) {
    const err = new Error('Invalid or expired refresh token'); err.statusCode = 401; err.code = 'INVALID_REFRESH'; throw err;
  }

  // Rotate — revoke old, issue new
  stored.revokedAt = new Date();
  await stored.save();

  const user = stored.userId;
  const newAccessToken = generateAccessToken({ id: user._id.toString(), role: user.role, institutionId: '' });
  const newRt = generateRefreshToken();
  await RefreshToken.create({
    userId: user._id, tokenHash: newRt.hash, expiresAt: newRt.expiresAt,
    ipAddress: meta.ip, userAgent: meta.userAgent
  });

  return { accessToken: newAccessToken, refreshToken: newRt.token };
}

// ── Logout ─────────────────────────────────────────────────────
async function logout(rawRefreshToken) {
  ensureDatabaseAvailable();
  if (!rawRefreshToken) return;
  const hash = hashRefreshToken(rawRefreshToken);
  await RefreshToken.findOneAndUpdate({ tokenHash: hash }, { revokedAt: new Date() });
}

module.exports = { register, login, refreshTokens, logout };
