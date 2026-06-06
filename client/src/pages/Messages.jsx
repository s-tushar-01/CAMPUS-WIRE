import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import { useSocket } from '../context/SocketContext';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/api/messages/conversations');
      const list = data.conversations || [];
      setConversations(list);
      const userId = params.get('userId');
      if (userId) {
        const existing = list.find((item) => item.user._id === userId)?.user;
        if (existing) setActiveUser(existing);
        else {
          const userRes = await api.get(`/api/users/${userId}`);
          setActiveUser(userRes.data.user);
        }
      }
    }
    load();
  }, [params]);

  const backToConversations = () => {
    setActiveUser(null);
    navigate('/messages', { replace: true });
  };

  return (
    <AppShell compact>
      <div className="grid h-[calc(100vh-96px)] grid-cols-1 gap-4 md:grid-cols-[340px_minmax(0,1fr)]">
        <div className={`${activeUser ? 'hidden md:block' : 'block'}`}>
          <ConversationList conversations={conversations} activeId={activeUser?._id} onBack={() => navigate('/')} onSelect={setActiveUser} onlineUsers={onlineUsers} />
        </div>
        <div className={`${activeUser ? 'block' : 'hidden md:block'}`}>
          <ChatWindow activeUser={activeUser} onBack={backToConversations} />
        </div>
      </div>
    </AppShell>
  );
}
