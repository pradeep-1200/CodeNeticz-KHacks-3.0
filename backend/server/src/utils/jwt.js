const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(payload) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');
  return jwt.sign(
    { sub: payload.id, role: payload.role, institutionId: payload.institutionId },
    secret,
    { algorithm: 'HS512', expiresIn: '15m' }
  );
}

function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('hex');
  const hash  = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, hash, expiresAt };
}

function hashRefreshToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');
  return jwt.verify(token, secret, { algorithms: ['HS512'] });
}

module.exports = { generateAccessToken, generateRefreshToken, hashRefreshToken, verifyAccessToken };
