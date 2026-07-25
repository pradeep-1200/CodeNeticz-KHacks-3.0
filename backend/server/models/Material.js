const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title:    { type: String, required: true, default: 'Untitled Material' },
    desc:     { type: String, default: '' },
    type:     { type: String, default: 'pdf' }, // video, pdf, audio, word, ppt
    date:     { type: String, default: '' },
    likes:    { type: Number, default: 0 },
    url:      { type: String, default: '' },  // Cloudinary URL
    publicId: { type: String, default: '' }   // Cloudinary Public ID
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
