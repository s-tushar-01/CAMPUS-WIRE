const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3 to 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  }
);

module.exports = router;
