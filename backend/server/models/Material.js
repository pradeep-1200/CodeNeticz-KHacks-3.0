const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: String,
    desc: String,
    type: String, // video, pdf, audio, word, ppt
    date: String,
    likes: Number,
    url: String, // Cloudinary URL
    publicId: String // Cloudinary Public ID
});

module.exports = mongoose.model('Material', materialSchema);
