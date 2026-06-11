const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { cloudinary } = require('../middleware/upload');

// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalPosts, totalMessages, newUsersToday, newPostsToday, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Message.countDocuments(),
        User.countDocuments({ createdAt: { $gte: todayStart } }),
        Post.countDocuments({ createdAt: { $gte: todayStart } }),
        User.find().sort({ createdAt: -1 }).limit(5).select('name username email createdAt profilePic role'),
      ]);

    res.json({
      success: true,
      stats: { totalUsers, totalPosts, totalMessages, newUsersToday, newPostsToday },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }
    if (req.query.role && ['participant', 'admin'].includes(req.query.role)) {
      query.role = req.query.role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id name username email role isActive createdAt profilePic');

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/users/:id/status
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    // Cannot deactivate self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Cannot deactivate other admins
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate another admin' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      isActive: user.isActive,
      message: user.isActive ? 'User activated' : 'User deactivated',
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete all user's posts and cloudinary images
    const userPosts = await Post.find({ author: req.params.id });
    for (const post of userPosts) {
      if (post.image && post.image.public_id) {
        await cloudinary.uploader.destroy(post.image.public_id);
      }
    }
    await Post.deleteMany({ author: req.params.id });

    // Delete profile/cover pics from cloudinary
    if (user.profilePic && user.profilePic.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
    }
    if (user.coverPic && user.coverPic.public_id) {
      await cloudinary.uploader.destroy(user.coverPic.public_id);
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User and all their content deleted' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/posts
// @access  Admin
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', '_id name username profilePic email');

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/admin/posts/:id
// @access  Admin
const deleteAnyPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.image && post.image.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/admin/broadcast
// @access  Admin
const sendBroadcast = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Broadcast content is required' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      isBroadcast: true,
    });

    // Notify all participants
    const participants = await User.find({ role: 'participant', isActive: true }).select('_id');
    const notifications = participants.map((p) => ({
      recipient: p._id,
      sender: req.user._id,
      type: 'broadcast',
      post: post._id,
      message: content.trim().substring(0, 100),
    }));

    await Notification.insertMany(notifications);

    const populated = await post.populate('author', '_id name username profilePic role');
    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllPosts,
  deleteAnyPost,
  sendBroadcast,
};
