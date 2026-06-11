import { ArrowLeft, CheckCheck, Paperclip, RotateCcw, Send, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Input } from '../ui/Form';
import EmptyState from '../ui/EmptyState';
import StatusBanner from '../ui/StatusBanner';
import { displayName, profilePath, usernameHandle } from '../../lib/utils';

export default function ChatWindow({ activeUser, onBack }) {
  const { user } = useAuth();
  const { sendMessage, incomingMessage, outgoingMessage, typingUsers, socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedMessage, setFailedMessage] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!activeUser?._id) return;
    setLoading(true);
    api.get(`/api/messages/${activeUser._id}`).then(({ data }) => setMessages(data.messages || [])).finally(() => setLoading(false));
  }, [activeUser?._id]);

  useEffect(() => {
    if (incomingMessage && incomingMessage.sender?._id === activeUser?._id) {
      setMessages((current) => [...current, incomingMessage]);
    }
  }, [incomingMessage, activeUser?._id]);

  useEffect(() => {
    if (outgoingMessage && String(outgoingMessage.receiver) === String(activeUser?._id)) {
      setMessages((current) => [...current, outgoingMessage]);
    }
  }, [outgoingMessage, activeUser?._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeUser) {
    return <div className="surface grid h-full place-items-center rounded-card p-6"><EmptyState icon={UserRound} title="Select a conversation" description="Pick a member to start messaging." /></div>;
  }

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    const body = content.trim();
    setContent('');
    if (socket?.connected) {
      sendMessage(activeUser._id, body);
    } else {
      try {
        const { data } = await api.post(`/api/messages/${activeUser._id}`, { content: body });
        setMessages((current) => [...current, data.message]);
        setFailedMessage('');
      } catch {
        setFailedMessage(body);
      }
    }
  };

  const emitTyping = () => {
    socket?.emit('typing:start', { receiverId: activeUser._id });
    window.clearTimeout(emitTyping.timer);
    emitTyping.timer = window.setTimeout(() => socket?.emit('typing:stop', { receiverId: activeUser._id }), 900);
  };

  return (
    <div className="surface flex h-[calc(100vh-96px)] flex-col rounded-card">
      <header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 md:hidden" onClick={onBack} aria-label="Back to conversations">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Link to={profilePath(activeUser)} className="relative">
          <Avatar user={activeUser} />
          {onlineUsers.has(activeUser._id) && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-success dark:border-slate-900" />}
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={profilePath(activeUser)} className="block truncate font-bold hover:text-primary">{displayName(activeUser, 'Member')}</Link>
          {usernameHandle(activeUser) && <p className="truncate text-xs font-semibold text-primary">{usernameHandle(activeUser)}</p>}
          <p className="text-xs text-slate-500">{onlineUsers.has(activeUser._id) ? 'Online' : 'Offline'}</p>
        </div>
        <Link to={profilePath(activeUser)} className="focus-ring hidden h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex" aria-label={`View ${displayName(activeUser, 'member')}'s profile`}>
          <UserRound className="h-4 w-4" />
        </Link>
      </header>
      <div className="flex-1 space-y-3 overflow-auto p-4">
        {!socket?.connected && <StatusBanner tone="warning" title="Realtime disconnected">Messages will use HTTP fallback until the socket reconnects.</StatusBanner>}
        {loading && <p className="text-center text-sm text-slate-500">Loading messages...</p>}
        {messages.map((message) => {
          const mine = String(message.sender?._id || message.sender) === String(user._id);
          return (
            <div key={message._id || `${message.createdAt}-${message.content}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[76%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-primary text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}>
                <p>{message.content}</p>
                <p className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>{message.createdAt ? format(message.createdAt) : 'now'}{mine && <CheckCheck className="h-3 w-3" />}</p>
              </div>
            </div>
          );
        })}
        {!loading && !messages.length && <EmptyState title="No messages yet" description="Send the first message and keep the campus conversation going." />}
        {typingUsers[activeUser._id] && <p className="text-xs font-semibold text-primary">{usernameHandle(activeUser) || displayName(activeUser, 'Member')} is typing...</p>}
        {failedMessage && (
          <StatusBanner tone="error" title="Message failed">
            <button className="inline-flex items-center gap-1 font-bold underline" onClick={() => setContent(failedMessage)}><RotateCcw className="h-3 w-3" /> Put it back in composer</button>
          </StatusBanner>
        )}
        <div ref={endRef} />
      </div>
      <form className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800" onSubmit={submit}>
        <Button variant="ghost" size="icon" disabled aria-label="Attach file"><Paperclip className="h-4 w-4" /></Button>
        <Input value={content} onChange={(event) => { setContent(event.target.value); emitTyping(); }} placeholder={`Message ${usernameHandle(activeUser) || displayName(activeUser, 'member')}`} />
        <Button type="submit" size="icon" aria-label="Send"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
