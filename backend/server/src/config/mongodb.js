const mongoose = require('mongoose');
const dns      = require('dns');
const logger   = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE DOES:
//   Connects to MongoDB Atlas on startup and creates query-optimisation indexes.
//
// WHY INDEXES?
//   Without indexes, MongoDB does a "collection scan" — it reads every document
//   in a collection to find matches (O(n) time). With indexes, it uses a B-tree
//   structure to jump directly to matching documents (O(log n) time).
//
// EXAMPLES:
//   - Finding notifications for a user without index: reads ALL notifications.
//   - With index on { userId, read }: reads only that user's unread records.
//   - For 10,000 notifications across 500 users, that's 10,000 reads → ~20 reads.
// ─────────────────────────────────────────────────────────────────────────────

async function ensureIndexes() {
    try {
        const db = mongoose.connection.db;

        // ── users collection ─────────────────────────────────────────
        // email: unique lookup on login — most critical index in the app
        // role: used when staff dashboard queries students/teachers
        await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
        await db.collection('users').createIndex({ role: 1 }, { background: true });

        // ── classes collection ───────────────────────────────────────
        // code: unique — used on every "join by code" request
        // teacherId: fetching all classes for a teacher (staff dashboard)
        await db.collection('classes').createIndex({ code: 1 }, { unique: true, background: true });
        await db.collection('classes').createIndex({ teacherId: 1 }, { background: true });

        // ── notifications collection ─────────────────────────────────
        // Compound index: fetching unread notifications for a specific user
        //   → Used in Navbar bell badge count (most frequent query)
        // TTL index: auto-delete notifications older than 30 days
        //   → MongoDB daemon removes expired docs automatically — no cron job needed
        await db.collection('notifications').createIndex(
            { userId: 1, read: 1, createdAt: -1 },
            { background: true }
        );
        await db.collection('notifications').createIndex(
            { createdAt: 1 },
            { expireAfterSeconds: 2592000, background: true } // 30 days TTL
        );

        // ── assignments collection ───────────────────────────────────
        // classId + createdAt: fetching assignments for a class, newest first
        //   → Used in Classwork tab and Grades & Submissions tab
        // submissions.studentId: checking if a student already submitted
        //   → Used in the upsert logic during "Turn In"
        await db.collection('assignments').createIndex(
            { classId: 1, createdAt: -1 },
            { background: true }
        );
        await db.collection('assignments').createIndex(
            { 'submissions.studentId': 1 },
            { background: true }
        );

        // ── announcements collection ─────────────────────────────────
        // classId + createdAt: fetching the Stream tab feed (newest first)
        await db.collection('announcements').createIndex(
            { classId: 1, createdAt: -1 },
            { background: true }
        );

        // ── invitations collection ───────────────────────────────────
        // studentId + status: checking pending invitations on student dashboard
        // classId: fetching all invitations sent for a class
        await db.collection('invitations').createIndex(
            { studentId: 1, status: 1 },
            { background: true }
        );
        await db.collection('invitations').createIndex({ classId: 1 }, { background: true });

        // ── prelims_tests collection ─────────────────────────────────
        // patternTag + type: adaptive test generation queries
        await db.collection('prelimstests').createIndex(
            { patternTag: 1, type: 1 },
            { background: true }
        );

        // ── refresh_tokens collection ────────────────────────────────
        // expiresAt TTL: auto-delete expired sessions — no manual cleanup
        await db.collection('refreshtokens').createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0, background: true }
        );

        logger.info('✅ MongoDB indexes ensured (query optimisation active)', { category: 'system' });
    } catch (err) {
        // Index creation failure is non-fatal — app continues, just slower queries
        logger.warn('MongoDB index creation warning (non-fatal)', { category: 'system', error: err.message });
    }
}

async function connectMongoDB() {
    if (mongoose.connection.readyState === 1) return;

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        logger.error('MONGODB_URI is not set — MongoDB will not connect');
        return;
    }

    // Set Google/Cloudflare DNS as primary resolvers for Atlas SRV lookups
    // WHY: Windows sometimes fails to resolve MongoDB Atlas SRV records
    //      using the default system DNS. Using 8.8.8.8 (Google) fixes this.
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

        // Create all performance indexes after connection is established
        await ensureIndexes();
    } catch (err) {
        logger.error('MongoDB connection failed', { category: 'system', error: err.message });
    }
}

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected', { category: 'system' });
});

module.exports = { connectMongoDB };
