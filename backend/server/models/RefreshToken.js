'use strict';

const mongoose = require('mongoose');

/**
 * RefreshToken — stores hashed refresh tokens for JWT rotation.
 *
 * The raw token is NEVER stored — only a SHA-256 hash (hashRefreshToken util).
 * On every token refresh the old document is revoked and a new one is created.
 * Expired / revoked tokens are filtered in queries; a TTL index auto-purges them.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // SHA-256 hex hash of the raw token sent to the client
    tokenHash: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },

    expiresAt: {
      type:     Date,
      required: true,
    },

    // Set when the token is rotated or the user logs out
    revokedAt: {
      type:    Date,
      default: null,
    },

    // Optional metadata for security auditing
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-delete expired tokens from MongoDB after they expire
// (TTL index fires ~60 s after the expiresAt value)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
