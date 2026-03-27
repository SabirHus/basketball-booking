const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure the Cloudinary SDK with secure environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Instantiate a cloud-based storage engine to prevent reliance on ephemeral local disk space
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'courtlink_profiles', 
    // Enforce strict file type validation at the middleware level to prevent malicious uploads
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

// Export the configured Multer middleware for consumption in the routing layer
const upload = multer({ storage: storage });

module.exports = upload;