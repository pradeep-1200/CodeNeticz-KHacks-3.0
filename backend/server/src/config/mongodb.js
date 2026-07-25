const mongoose = require('mongoose');
const dns      = require('dns');
const logger   = require('../utils/logger');

// ── Force Google DNS immediately at module load time ──────────
// Must run BEFORE mongoose makes any SRV lookups.
// System DNS (assigned by hotspot/router) often refuses port 53 for
// mongodb+srv:// SRV queries, causing ECONNREFUSED before connect() is called.
(function forceGoogleDns() {
  const envDns = process.env.MONGODB_DNS_SERVERS;
  const servers = envDns
    ? envDns.split(',').map(s => s.trim()).filter(Boolean)
    : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];
  try {
    dns.setServers(servers);
  } catch (_) { /* non-fatal */ }
})();

async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    logger.error('MONGODB_URI is not set MongoDB will not connect');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    logger.info('MongoDB Atlas connected successfully', { category: 'system' });
  } catch (err) {
    logger.error('MongoDB connection failed', { category: 'system', error: err.message });
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected', { category: 'system' });
});

module.exports = { connectMongoDB };
