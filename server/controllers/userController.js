const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../middleware/upload');

// @route   GET /api/users/:id
// @access  Protected
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', '_id name profilePic')
      .populate('following', '_id name profilePic');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = user.followers.some(
      (f) => f._id.toString() === req.user._id.toString()
    );

    res.json({ success: true, user, isFollowing });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/profile
// @access  Protected
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Update text fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;

    // Handle profile pic upload
    if (req.files && req.files.profilePic) {
      // Delete old image from cloudinary if exists
      if (user.profilePic && user.profilePic.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
      }
      user.profilePic = {
        url: req.files.profilePic[0].path,
        public_id: req.files.profilePic[0].filename,
      };
    }

    // Handle cover pic upload
    if (req.files && req.files.coverPic) {
      if (user.coverPic && user.coverPic.public_id) {
        await cloudinary.uploader.destroy(user.coverPic.public_id);
      }
      user.coverPic = {
        url: req.files.coverPic[0].path,
        public_id: req.files.coverPic[0].filename,
      };
    }

    // Single file upload (from uploadProfile or uploadCover)
    if (req.file) {
      const fieldname = req.file.fieldname;
      if (fieldname === 'profilePic') {
        if (user.profilePic && user.profilePic.public_id) {
          await cloudinary.uploader.destroy(user.profilePic.public_id);
        }
        user.profilePic = { url: req.file.path, public_id: req.file.filename };
      } else if (fieldname === 'coverPic') {
        if (user.coverPic && user.coverPic.public_id) {
          await cloudinary.uploader.destroy(user.coverPic.public_id);
        }
        user.coverPic = { url: req.file.path, public_id: req.file.filename };
      }
    }

    await user.save({ validateBeforeSave: false });
    const updated = await User.findById(user._id).select('-password');
    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/:id/follow
// @access  Protected
const followUnfollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    const isFollowing = targetUser.followers.includes(req.user._id);

    if (isFollowing) {
      // Unfollow
      targetUser.followers.pull(req.user._id);
      currentUser.following.pull(req.params.id);
      await Promise.all([targetUser.save(), currentUser.save()]);
      return res.json({ success: true, following: false, followersCount: targetUser.followers.length });
    } else {
      // Follow
      targetUser.followers.push(req.user._id);
      currentUser.following.push(req.params.id);
      await Promise.all([targetUser.save(), currentUser.save()]);

      // Create follow notification
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow',
      });

      return res.json({ success: true, following: true, followersCount: targetUser.followers.length });
    }
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/search?q=
// @access  Protected
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { $or: [{ name: regex }, { email: regex }] },
      ],
    })
      .select('_id name email profilePic bio')
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/suggestions
// @access  Protected
const getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [...currentUser.following, req.user._id];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('_id name profilePic bio')
      .limit(5);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, followUnfollow, searchUsers, getSuggestions };
