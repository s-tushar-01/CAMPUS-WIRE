const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllPosts,
  deleteAnyPost,
  sendBroadcast,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deleteAnyPost);
router.post('/broadcast', sendBroadcast);

module.exports = router;
