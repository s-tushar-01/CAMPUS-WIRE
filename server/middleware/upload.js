const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for post images
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'social-network/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1080, crop: 'limit' }],
  },
});

// Storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'social-network/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// Storage for cover pictures
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'social-network/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 400, crop: 'fill' }],
  },
});

const uploadPost = multer({ storage: postStorage }).single('image');
const uploadProfile = multer({ storage: profileStorage }).single('profilePic');
const uploadCover = multer({ storage: coverStorage }).single('coverPic');

module.exports = { cloudinary, uploadPost, uploadProfile, uploadCover };
