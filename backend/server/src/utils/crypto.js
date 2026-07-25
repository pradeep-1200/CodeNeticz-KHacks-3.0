const argon2 = require('argon2');

const OPTS = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 };

async function hashPassword(plain) { return argon2.hash(plain, OPTS); }

async function verifyPassword(hash, plain) {
  try { return await argon2.verify(hash, plain); } catch { return false; }
}

module.exports = { hashPassword, verifyPassword };
