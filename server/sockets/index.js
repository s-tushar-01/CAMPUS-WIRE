const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const onlineUsers = new Map();

const initSocket = (httpServer) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      return next();
    } catch {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    const authenticatedUserId = socket.data.userId?.toString();

    socket.on('user:online', () => {
      if (!authenticatedUserId) return;
      onlineUsers.set(authenticatedUserId, socket.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });

    socket.on('message:send', async ({ receiverId, content }) => {
      try {
        if (!authenticatedUserId || !receiverId || !content?.trim()) {
          socket.emit('message:error', { message: 'Invalid message payload' });
          return;
        }

        const message = await Message.create({
          sender: authenticatedUserId,
          receiver: receiverId,
          content: content.trim(),
        });
        await message.populate('sender', '_id name profilePic');

        const receiverSocketId = onlineUsers.get(receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', message);
        }
        socket.emit('message:sent', message);
      } catch (error) {
        socket.emit('message:error', { message: 'Failed to send message' });
        console.error('Socket message error:', error);
      }
    });

    socket.on('typing:start', ({ receiverId }) => {
      const receiverSocketId = receiverId ? onlineUsers.get(receiverId.toString()) : null;
      if (receiverSocketId) io.to(receiverSocketId).emit('typing:start', { senderId: authenticatedUserId });
    });

    socket.on('typing:stop', ({ receiverId }) => {
      const receiverSocketId = receiverId ? onlineUsers.get(receiverId.toString()) : null;
      if (receiverSocketId) io.to(receiverSocketId).emit('typing:stop', { senderId: authenticatedUserId });
    });

    socket.on('disconnect', () => {
      if (authenticatedUserId && onlineUsers.get(authenticatedUserId) === socket.id) {
        onlineUsers.delete(authenticatedUserId);
      }
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

module.exports = { initSocket, onlineUsers };
