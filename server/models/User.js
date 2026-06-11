const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function normalizeUsername(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_]/g, '');
}

function usernameBase(name = '', email = '') {
  const fromName = normalizeUsername(String(name || '').replace(/\s+/g, '_'));
  const fromEmail = normalizeUsername(String(email || '').split('@')[0]);
  return (fromName || fromEmail || 'campus_user').slice(0, 24);
}

function reservationModel() {
  return mongoose.models.UsernameReservation || require('./UsernameReservation');
}

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
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  password: {
    type: String,
    select: false, // not returned by default
  },
  googleId: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
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
  isDemoOnline: {
    type: Boolean,
    default: false,
  },
  // OTP for forgot password and email verification
  hashedOTP: { type: String },
  otpExpiry: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('validate', async function (next) {
  try {
    const UsernameReservation = reservationModel();

    if (this.username) {
      this.username = normalizeUsername(this.username);
    }

    if (this.username) {
      const reserved = await UsernameReservation.findOne({ username: this.username });
      if (reserved && reserved.user.toString() !== this._id.toString()) {
        return next(new Error('Username has already been used'));
      }
    }

    if (!this.username) {
      const User = this.constructor;
      const base = usernameBase(this.name, this.email);
      let candidate = base.length >= 3 ? base : `${base}_cw`;
      let suffix = 1;

      while (
        await User.exists({ username: candidate, _id: { $ne: this._id } }) ||
        await UsernameReservation.exists({ username: candidate, user: { $ne: this._id } })
      ) {
        const trimmedBase = base.slice(0, Math.max(3, 30 - String(suffix).length - 1));
        candidate = `${trimmedBase}_${suffix}`;
        suffix += 1;
      }

      this.username = candidate;
    }

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.post('save', async function (doc, next) {
  try {
    if (doc.username) {
      const UsernameReservation = reservationModel();
      await UsernameReservation.updateOne(
        { username: doc.username },
        { $setOnInsert: { username: doc.username, user: doc._id } },
        { upsert: true }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
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

userSchema.statics.normalizeUsername = normalizeUsername;

module.exports = mongoose.model('User', userSchema);
