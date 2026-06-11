import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { displayName, usernameHandle } from '../lib/utils';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [demoOnlineUsers, setDemoOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [outgoingMessage, setOutgoingMessage] = useState(null);

  useEffect(() => {
    if (!user || !token) return undefined;

    const nextSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    nextSocket.on('connect', () => nextSocket.emit('user:online', user._id));
    nextSocket.on('users:online', (users) => setOnlineUsers(new Set(users)));
    nextSocket.on('message:receive', (message) => {
      setIncomingMessage(message);
      toast.info(`New message from ${usernameHandle(message.sender) || displayName(message.sender, 'CampusWire')}`);
    });
    nextSocket.on('message:sent', (message) => setOutgoingMessage(message));
    nextSocket.on('message:error', (error) => toast.error(error?.message || 'Message failed'));
    nextSocket.on('typing:start', ({ senderId }) => setTypingUsers((prev) => ({ ...prev, [senderId]: true })));
    nextSocket.on('typing:stop', ({ senderId }) => setTypingUsers((prev) => ({ ...prev, [senderId]: false })));

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      setSocket(null);
      setOnlineUsers(new Set());
      setTypingUsers({});
    };
  }, [user, token]);

  useEffect(() => {
    if (!user || import.meta.env.VITE_DEMO_ONLINE_USERS !== 'true') {
      setDemoOnlineUsers(new Set());
      return;
    }

    let active = true;
    api.get('/api/users/suggestions')
      .then(({ data }) => {
        if (!active) return;
        setDemoOnlineUsers(new Set((data.users || []).filter((item) => item.isDemoOnline).map((item) => item._id)));
      })
      .catch(() => {
        if (active) setDemoOnlineUsers(new Set());
      });

    return () => {
      active = false;
    };
  }, [user]);

  const sendMessage = (receiverId, content) => {
    socket?.emit('message:send', { receiverId, content });
  };

  const value = useMemo(
    () => ({ socket, onlineUsers: new Set([...onlineUsers, ...demoOnlineUsers]), typingUsers, incomingMessage, outgoingMessage, sendMessage }),
    [socket, onlineUsers, demoOnlineUsers, typingUsers, incomingMessage, outgoingMessage]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
}
