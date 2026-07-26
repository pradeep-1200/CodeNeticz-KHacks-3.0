'use strict';

require('dotenv').config();

const { validateEnv } = require('./src/config/env');
validateEnv(); // Exit immediately if required env vars are missing

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const cookieParser = require('cookie-parser');
const path      = require('path');
const { spawn } = require('child_process');

const { connectMongoDB }      = require('./src/config/mongodb');
const { requestLogger }       = require('./src/middleware/requestLogger');
const { globalLimiter }       = require('./src/middleware/rateLimiter');
const { errorHandler }        = require('./src/middleware/errorHandler');
const logger                  = require('./src/utils/logger');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── 1. Security Middleware ──────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc:     ["'self'", "data:", "res.cloudinary.com"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"]
    }
  }
}));

// ── CORS — environment-driven exact origin matching ────────────
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];

const defaultOrigins = [
  process.env.CLIENT_URL || 'https://aclc-frontend.vercel.app',
  'http://localhost:5173'
];

const allowedOrigins = Array.from(new Set([...rawAllowedOrigins, ...defaultOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 2. Routes ──────────────────────────────────────────────────
app.use('/api/v1/auth',          require('./src/modules/auth/auth.routes'));

// Legacy routes — kept for backward compatibility during migration
// These will be refactored to /api/v1/ modules in P3
const { authenticate } = require('./src/middleware/auth');

// P1 FIX: Legacy auth route now uses real Argon2 + JWT (delegates to auth.service.js)
app.use('/api/auth',          require('./routes/auth'));

app.use('/api/student',       authenticate, require('./routes/student'));
app.use('/api/students',      authenticate, require('./routes/students'));
app.use('/api/materials',     authenticate, require('./routes/material'));
app.use('/api/levels',        authenticate, require('./routes/levels'));
app.use('/api/classes',       authenticate, require('./routes/classes'));
app.use('/api/classes',       authenticate, require('./routes/assessments'));   // Phase 3: teacher assessment CRUD
app.use('/api/submissions',  authenticate, require('./routes/submissions'));    // Phase 4: student assessment attempt
app.use('/api/analytics',   authenticate, require('./routes/analytics'));       // Phase 8: AI analytics
app.use('/api/ai',           authenticate, require('./routes/mathAssistant'));  // Phase 6: AI math assistant
app.use('/api/stt',           authenticate, require('./routes/stt'));
app.use('/api/dyslexia',      authenticate, require('./routes/dyslexia'));
app.use('/api/ocr',           authenticate, require('./routes/ocr'));
app.use('/api/dyscalculia',   authenticate, require('./routes/dyscalculia'));
app.use('/api/assignments',   authenticate, require('./routes/assignments'));
app.use('/api/notifications', authenticate, require('./routes/notifications'));
app.use('/api/announcements', authenticate, require('./routes/announcements'));
app.use('/api/prelims',       authenticate, require('./routes/prelims'));
app.use('/api/staff',         authenticate, require('./routes/staff'));

// Versioned aliases for legacy feature routes. Authentication is shared with
// the versioned auth API, which keeps every frontend request on /api/v1.
app.use('/api/v1/student',       authenticate, require('./routes/student'));
app.use('/api/v1/students',      authenticate, require('./routes/students'));
app.use('/api/v1/materials',     authenticate, require('./routes/material'));
app.use('/api/v1/levels',        authenticate, require('./routes/levels'));
app.use('/api/v1/classes',       authenticate, require('./routes/classes'));
app.use('/api/v1/classes',       authenticate, require('./routes/assessments'));  // Phase 3: teacher assessment CRUD
app.use('/api/v1/submissions',   authenticate, require('./routes/submissions'));   // Phase 4: student assessment attempt
app.use('/api/v1/analytics',    authenticate, require('./routes/analytics'));      // Phase 8: AI analytics
app.use('/api/v1/ai',            authenticate, require('./routes/mathAssistant'));  // Phase 6: AI math assistant
app.use('/api/v1/stt',           authenticate, require('./routes/stt'));
app.use('/api/v1/dyslexia',      authenticate, require('./routes/dyslexia'));
app.use('/api/v1/ocr',           authenticate, require('./routes/ocr'));
app.use('/api/v1/dyscalculia',   authenticate, require('./routes/dyscalculia'));
app.use('/api/v1/assignments',   authenticate, require('./routes/assignments'));
app.use('/api/v1/notifications', authenticate, require('./routes/notifications'));
app.use('/api/v1/announcements', authenticate, require('./routes/announcements'));
app.use('/api/v1/prelims',       authenticate, require('./routes/prelims'));
app.use('/api/v1/staff',         authenticate, require('./routes/staff'));

// Health check (no auth)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 3. 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } });
});

// ── 4. Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ── 5. Python AI Service Manager ──────────────────────────────
let pythonProcess = null;

async function startPythonService() {
  const aiPath = path.join(__dirname, '../../services/ai');
  const pyExe  = process.env.PYTHON_EXECUTABLE || 'python';
  const aiUrl  = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    pythonProcess = spawn(pyExe, ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: aiPath, stdio: ['ignore', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', d => logger.info(d.toString().trim(), { category: 'ai-service' }));
    pythonProcess.stderr.on('data', d => logger.info(d.toString().trim(), { category: 'ai-service' }));
    pythonProcess.on('error', err => {
      logger.warn('Python AI service not available — AI features degraded', { category: 'ai-service', error: err.message });
    });

    // Wait up to 30s for health check
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`${aiUrl}/health/ping`);
        if (res.ok) { logger.info('Python AI service ready', { category: 'ai-service' }); return; }
      } catch {}
      await new Promise(r => setTimeout(r, 1000));
    }
    logger.warn('Python AI service health check timed out — AI features may be unavailable', { category: 'ai-service' });
  } catch (err) {
    logger.warn('Could not start Python AI service', { category: 'ai-service', error: err.message });
  }
}

// ── 6. Startup ────────────────────────────────────────────────
async function startServer() {
  await connectMongoDB();

  // Start Python AI service (non-blocking — server starts even if Python is missing)
  startPythonService().catch(() => {});

  app.listen(PORT, () => {
    logger.info(`ACLC API server running on port ${PORT}`, { category: 'system', port: PORT, env: process.env.NODE_ENV });
  });
}

// ── 7. Graceful Shutdown ──────────────────────────────────────
function shutdown(signal) {
  logger.info(`Received ${signal} — shutting down gracefully`, { category: 'system' });
  if (pythonProcess) pythonProcess.kill();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

startServer().catch(err => {
  logger.error('Failed to start server', { category: 'system', error: err.message });
  process.exit(1);
});
