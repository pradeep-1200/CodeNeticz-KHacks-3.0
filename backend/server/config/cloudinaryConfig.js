const cloudinary = require('cloudinary').v2;

// Only configure manually if individual keys are present.
// If CLOUDINARY_URL is present, the SDK handles it automatically.
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary manually configured:', { cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY });
}

module.exports = cloudinary;
