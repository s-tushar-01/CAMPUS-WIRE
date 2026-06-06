const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // not returned by default
  },
  googleId: {
    type: String,
  },
  profilePic: {
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/social-network/profiles/default_avatar.png',
    },
    public_id: {
      type: String,
      default: '',
    },
  },
  coverPic: {
    url: { type: String, default: '' },
    public_id: { type: String, default: '' },
  },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  role: {
    type: String,
    enum: ['participant', 'admin'],
    default: 'participant',
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  // OTP for forgot password
  hashedOTP: { type: String },
  otpExpiry: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook: hash password only if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
