// FIX: removed DATABASE_URL from REQUIRED_VARS — Prisma/PostgreSQL is not used
//      in any active route. Requiring it was crashing the server when only MongoDB is configured.
const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`[STARTUP ERROR] Missing required environment variables:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    console.error('[STARTUP ERROR] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    process.exit(1);
  }
}

module.exports = { validateEnv };
