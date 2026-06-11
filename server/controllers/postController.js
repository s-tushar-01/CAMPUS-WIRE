const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { cloudinary } = require('../middleware/upload');
const mongoose = require('mongoose');

const REACTION_TYPES = ['like', 'love', 'celebrate', 'helpful', 'curious'];
const AUDIENCES = ['campus', 'followers', 'friends', 'private'];

const postPopulate = [
  { path: 'author', select: '_id name username profilePic role' },
  { path: 'comments.user', select: '_id name username profilePic' },
  { path: 'comments.replies.user', select: '_id name username profilePic' },
  {
    path: 'shareOf',
    populate: [
      { path: 'author', select: '_id name username profilePic role' },
      { path: 'comments.user', select: '_id name username profilePic' },
      { path: 'comments.replies.user', select: '_id name username profilePic' },
    ],
  },
];

const populatePost = (query) => postPopulate.reduce((current, item) => current.populate(item), query);

const syncLegacyLikes = (post) => {
  post.likes = (post.reactions || [])
    .filter((reaction) => reaction.type === 'like')
    .map((reaction) => reaction.user);
};

const findUserReaction = (post, userId) => {
  const userIdText = userId.toString();
  const matches = (post.reactions || []).filter((item) => item.user.toString() === userIdText);
  matches.slice(1).forEach((item) => post.reactions.pull(item._id));
  return matches[0];
};

const accessiblePostQuery = (user, filter = 'all') => {
  const following = user.following || [];
  const baseAccess = [
    { author: user._id },
    { isBroadcast: true },
    { audience: 'campus' },
    { audience: 'followers', author: { $in: following } },
  ];

  if (filter === 'following') {
    return {
      $and: [
        { $or: baseAccess },
        { $or: [{ author: { $in: [...following, user._id] } }, { isBroadcast: true }] },
      ],
    };
  }

  if (filter === 'announcements') {
    return { isBroadcast: true };
  }

  if (filter === 'mine') {
    return { author: user._id };
  }

  return { $or: baseAccess };
};

const canViewPost = (post, user) => {
  const authorId = post.author?._id || post.author;
  return (
    authorId.toString() === user._id.toString() ||
    post.isBroadcast ||
    post.audience === 'campus' ||
    (post.audience === 'followers' && user.following.some((id) => id.toString() === authorId.toString()))
  );
};

// @route   POST /api/posts
// @access  Protected
const createPost = async (req, res, next) => {
  try {
    const { content, isBroadcast, audience = 'campus' } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({ success: false, message: 'Post must have content or an image' });
    }

    const postData = {
      author: req.user._id,
      content: content || '',
    };

    if (AUDIENCES.includes(audience)) {
      postData.audience = audience;
    }

    if (req.file) {
      postData.image = { url: req.file.path, public_id: req.file.filename };
    }

    if (req.user.role === 'admin' && isBroadcast === 'true') {
      postData.isBroadcast = true;
    }

    const post = await Post.create(postData);
    const populated = await post.populate('author', '_id name username profilePic role');

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
    const filter = req.query.filter || 'all';
    const skip = (page - 1) * limit;
    const query = accessiblePostQuery(req.user, filter);

    const total = await Post.countDocuments(query);
    const posts = await populatePost(Post.find(query))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
    const post = await populatePost(Post.findById(req.params.id));

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (!canViewPost(post, req.user)) return res.status(403).json({ success: false, message: 'Not authorized to view this post' });

    const reaction = post.reactions.find((item) => item.user.toString() === req.user._id.toString());
    const isLiked = reaction?.type === 'like';
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
    const profileUser = mongoose.Types.ObjectId.isValid(req.params.userId)
      ? await User.findById(req.params.userId).select('_id')
      : await User.findOne({ username: User.normalizeUsername(req.params.userId) }).select('_id');

    if (!profileUser) return res.status(404).json({ success: false, message: 'User not found' });

    const profileUserId = profileUser._id;
    const ownProfile = profileUserId.toString() === req.user._id.toString();
    const audienceQuery = ownProfile
      ? { author: profileUserId }
      : {
          author: profileUserId,
          $or: [
            { audience: 'campus' },
            { isBroadcast: true },
            { audience: 'followers', author: { $in: req.user.following || [] } },
          ],
        };

    const total = await Post.countDocuments(audienceQuery);
    const posts = await populatePost(Post.find(audienceQuery))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

    const existing = findUserReaction(post, req.user._id);
    const alreadyLiked = existing?.type === 'like';

    if (!alreadyLiked) {
      if (existing) existing.type = 'like';
      else post.reactions.push({ user: req.user._id, type: 'like' });

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

    syncLegacyLikes(post);
    await post.save();
    res.json({ success: true, likes: post.likes.length, reactions: post.reactions, isLiked: true });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/posts/:id/reaction
// @access  Protected
const reactToPost = async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!REACTION_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existing = findUserReaction(post, req.user._id);
    const alreadyReacted = existing?.type === type;

    if (alreadyReacted) {
      existing.createdAt = existing.createdAt || new Date();
    } else if (existing) {
      existing.type = type;
      existing.createdAt = new Date();
    } else {
      post.reactions.push({ user: req.user._id, type });
    }

    syncLegacyLikes(post);
    await post.save();

    if (!alreadyReacted && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: type === 'like' ? 'like' : 'reaction',
        post: post._id,
        message: type,
      });
    }

    const populated = await populatePost(Post.findById(post._id));
    res.json({ success: true, post: populated, removed: false });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/posts/:id/share
// @access  Protected
const sharePost = async (req, res, next) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!canViewPost(original, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this post' });
    }

    const { content = '', audience = 'campus' } = req.body;
    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      shareComment: content.trim(),
      shareOf: original._id,
      audience: AUDIENCES.includes(audience) ? audience : 'campus',
    });

    if (original.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: original.author,
        sender: req.user._id,
        type: 'share',
        post: original._id,
      });
    }

    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ success: true, post: populated });
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

    await post.populate('comments.user', '_id name username profilePic');
    await post.populate('comments.replies.user', '_id name username profilePic');
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/posts/:id/comment/:commentId/reply
// @access  Protected
const addReply = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }
    if (text.length > 500) {
      return res.status(400).json({ success: false, message: 'Reply must be 500 characters or less' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ user: req.user._id, text: text.trim() });
    await post.save();

    const notifyUsers = new Set([
      post.author.toString(),
      comment.user.toString(),
    ]);
    notifyUsers.delete(req.user._id.toString());

    await Promise.all(Array.from(notifyUsers).map((recipient) => Notification.create({
      recipient,
      sender: req.user._id,
      type: 'comment',
      post: post._id,
      message: 'replied',
    })));

    await post.populate('comments.user', '_id name username profilePic');
    await post.populate('comments.replies.user', '_id name username profilePic');
    res.status(201).json({ success: true, comments: post.comments });
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

// @route   DELETE /api/posts/:id/comment/:commentId/reply/:replyId
// @access  Protected
const deleteReply = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    if (
      reply.user.toString() !== req.user._id.toString() &&
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reply' });
    }

    comment.replies.pull({ _id: req.params.replyId });
    await post.save();

    await post.populate('comments.user', '_id name username profilePic');
    await post.populate('comments.replies.user', '_id name username profilePic');
    res.json({ success: true, comments: post.comments });
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
  reactToPost,
  sharePost,
  addComment,
  addReply,
  deleteComment,
  deleteReply,
  deletePost,
};
