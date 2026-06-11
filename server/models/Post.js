const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: 500,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: 500,
    trim: true,
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'love', 'celebrate', 'helpful', 'curious'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
  },
  content: {
    type: String,
    maxlength: 2000,
    trim: true,
  },
  image: {
    url: { type: String, default: '' },
    public_id: { type: String, default: '' },
  },
  audience: {
    type: String,
    enum: ['campus', 'followers', 'friends', 'private'],
    default: 'campus',
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  reactions: [reactionSchema],
  comments: [commentSchema],
  shareOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  shareComment: {
    type: String,
    maxlength: 500,
    trim: true,
    default: '',
  },
  isBroadcast: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient feed queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isBroadcast: 1, createdAt: -1 });
postSchema.index({ audience: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
