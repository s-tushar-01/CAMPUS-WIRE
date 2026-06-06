const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { cloudinary } = require('../middleware/upload');

// @route   POST /api/posts
// @access  Protected
const createPost = async (req, res, next) => {
  try {
    const { content, isBroadcast } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({ success: false, message: 'Post must have content or an image' });
    }

    const postData = {
      author: req.user._id,
      content: content || '',
    };

    if (req.file) {
      postData.image = { url: req.file.path, public_id: req.file.filename };
    }

    if (req.user.role === 'admin' && isBroadcast === 'true') {
      postData.isBroadcast = true;
    }

    const post = await Post.create(postData);
    const populated = await post.populate('author', '_id name profilePic role');

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/posts/feed
// @access  Protected
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { author: { $in: [...req.user.following, req.user._id] } },
        { isBroadcast: true },
      ],
    };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', '_id name profilePic role')
      .populate('comments.user', '_id name profilePic');

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/posts/:id
// @access  Protected
const getSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', '_id name profilePic role')
      .populate('comments.user', '_id name profilePic');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isLiked = post.likes.some((id) => id.toString() === req.user._id.toString());
    res.json({ success: true, post, isLiked });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/posts/user/:userId
// @access  Protected
const getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments({ author: req.params.userId });
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', '_id name profilePic role');

    res.json({
      success: true,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/posts/:id/like
// @access  Protected
const likeUnlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      // Notify post author (skip if own post)
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id,
        });
      }
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/posts/:id/comment
// @access  Protected
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    if (text.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment must be 500 characters or less' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();

    // Notify post author (skip if own post)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
      });
    }

    await post.populate('comments.user', '_id name profilePic');
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Protected
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    // Only comment owner or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/posts/:id
// @access  Protected
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Only author or admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Delete cloudinary image
    if (post.image && post.image.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  getSinglePost,
  getUserPosts,
  likeUnlikePost,
  addComment,
  deleteComment,
  deletePost,
};
