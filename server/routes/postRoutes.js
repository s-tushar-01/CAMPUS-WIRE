const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');
const {
  createPost,
  getFeed,
  getSinglePost,
  getUserPosts,
  likeUnlikePost,
  reactToPost,
  sharePost,
  addComment,
  deleteComment,
  deletePost,
} = require('../controllers/postController');

// Order matters — specific before parameterized
router.get('/feed', protect, getFeed);
router.get('/user/:userId', protect, getUserPosts);
router.post('/', protect, uploadPost, createPost);
router.get('/:id', protect, getSinglePost);
router.put('/:id/like', protect, likeUnlikePost);
router.put('/:id/reaction', protect, reactToPost);
router.post('/:id/share', protect, sharePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
