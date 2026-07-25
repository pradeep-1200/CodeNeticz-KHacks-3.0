const mongoose = require('mongoose');
const dns      = require('dns');
const logger   = require('../utils/logger');

async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    logger.error('MONGODB_URI is not set MongoDB will not connect');
    return;
  }

  // Set Google DNS (8.8.8.8, 8.8.4.4, 1.1.1.1) as primary resolvers for SRV lookups on Windows
  const envDns = process.env.MONGODB_DNS_SERVERS;
  const dnsServers = envDns
    ? envDns.split(',').map(s => s.trim()).filter(Boolean)
    : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

  try {
    dns.setServers(dnsServers);
    logger.info(`Using DNS resolvers for MongoDB Atlas: ${dnsServers.join(', ')}`, { category: 'system' });
  } catch (err) {
    logger.warn('Could not set DNS resolvers for MongoDB', { category: 'system', error: err.message });
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    logger.info('MongoDB Atlas connected successfully', { category: 'system' });
  } catch (err) {
    logger.error('MongoDB connection failed', { category: 'system', error: err.message });
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected', { category: 'system' });
});

module.exports = { connectMongoDB };
