const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/auth');
const { updateProfile, followUnfollow, searchUsers, getSuggestions, getUserProfile } = require('../controllers/userController');

// Combined upload for profile: accept both profilePic and coverPic in one request
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: file.fieldname === 'coverPic' ? 'social-network/covers' : 'social-network/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: file.fieldname === 'coverPic'
      ? [{ width: 1200, height: 400, crop: 'fill' }]
      : [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  }),
});

const uploadProfileFields = multer({ storage: profileStorage }).fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'coverPic', maxCount: 1 },
]);

// Order matters — specific routes BEFORE parameterized ones
router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.put('/profile', protect, uploadProfileFields, updateProfile);
router.get('/:id', protect, getUserProfile);
router.put('/:id/follow', protect, followUnfollow);

module.exports = router;
