'use strict';

const mongoose = require('mongoose');

/**
 * Announcement — classroom stream post created by a teacher.
 * Used by routes/announcements.js for GET /class/:classId and POST /create.
 */
const announcementSchema = new mongoose.Schema(
  {
    classId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Class',
      required: true,
      index:    true,
    },

    authorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    content: {
      type:     String,
      required: true,
      trim:     true,
    },

    // Optional array of Cloudinary URLs or file paths
    attachments: {
      type:    [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
