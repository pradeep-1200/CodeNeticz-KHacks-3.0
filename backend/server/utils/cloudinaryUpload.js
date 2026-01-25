const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer) => {
    console.log('Uploading to Cloudinary, buffer size:', fileBuffer.length);
    return new Promise((resolve, reject) => {
        console.log('Cloudinary config:', { cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY });
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                // Ensure it's public (explicitly set type to 'upload')
                type: 'upload',
                access_mode: 'public'
            },
            (error, result) => {
                console.log('Upload callback invoked');
                if (result) {
                    console.log("Cloudinary Upload Success:", result);
                    resolve(result);
                } else {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;
