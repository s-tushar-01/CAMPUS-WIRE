const mongoose = require('mongoose');
const Message = require('../models/Message');

// @route   GET /api/messages/conversations
// @access  Protected
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', '_id name username profilePic')
      .populate('receiver', '_id name username profilePic');

    // Build conversation map
    const conversationMap = new Map();

    for (const msg of messages) {
      const partner =
        msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender;
      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        const unreadCount = await Message.countDocuments({
          sender: partner._id,
          receiver: userId,
          isRead: false,
        });

        conversationMap.set(partnerId, {
          user: partner,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/messages/:userId
// @access  Protected
const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    };

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', '_id name username profilePic');

    // Mark received messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/messages/:userId
// @access  Protected
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message must be 1000 characters or less' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      content: content.trim(),
    });

    const populated = await message.populate('sender', '_id name username profilePic');
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getConversations, getMessages, sendMessage };
