import { ArrowLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { format } from 'timeago.js';

export default function ConversationList({ conversations, activeId, onBack, onSelect, onlineUsers }) {
  return (
    <div className="surface h-full rounded-card p-2">
      <div className="flex items-center gap-3 border-b border-slate-200 px-3 py-3 dark:border-slate-800">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onBack} aria-label="Back to feed">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold">Messages</h1>
          <p className="text-xs text-slate-500">Private realtime conversations</p>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {conversations.map((conversation) => {
          const user = conversation.user;
          const active = activeId === user._id;
          return (
            <button key={user._id} className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${active ? 'bg-indigo-50 dark:bg-indigo-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} onClick={() => onSelect(user)}>
              <div className="relative">
                <Avatar user={user} />
                {onlineUsers.has(user._id) && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-success dark:border-slate-900" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold">{user.name}</p>
                  <span className="text-[11px] text-slate-400">{conversation.lastMessage?.createdAt ? format(conversation.lastMessage.createdAt) : ''}</span>
                </div>
                <p className="truncate text-xs text-slate-500">{conversation.lastMessage?.content || 'Start a conversation'}</p>
              </div>
              {!!conversation.unreadCount && <Badge>{conversation.unreadCount}</Badge>}
            </button>
          );
        })}
        {!conversations.length && <p className="p-4 text-sm text-slate-500">No conversations yet. Start from a member profile.</p>}
      </div>
    </div>
  );
}
