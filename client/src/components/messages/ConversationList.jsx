import { ArrowLeft, MessageSquarePlus, Users } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import StatusBanner from '../ui/StatusBanner';
import { format } from 'timeago.js';
import { displayName, usernameHandle } from '../../lib/utils';

export default function ConversationList({ conversations, activeId, onBack, onSelect, onlineUsers, loading = false }) {
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
        <div className="px-2 pb-2">
          <StatusBanner title="Group chats planned">Realtime one-to-one chat is active. Group creation UI is ready for a future backend.</StatusBanner>
          <Button className="mt-2 w-full" variant="outline" disabled><Users className="h-4 w-4" /> New group</Button>
        </div>
        {loading && <div className="space-y-2 p-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>}
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
                  <p className="truncate text-sm font-bold">{displayName(user, 'Member')}</p>
                  <span className="text-[11px] text-slate-400">{conversation.lastMessage?.createdAt ? format(conversation.lastMessage.createdAt) : ''}</span>
                </div>
                {usernameHandle(user) && <p className="truncate text-xs font-semibold text-primary">{usernameHandle(user)}</p>}
                <p className="truncate text-xs text-slate-500">{conversation.lastMessage?.content || 'Start a conversation'}</p>
              </div>
              {!!conversation.unreadCount && <Badge>{conversation.unreadCount}</Badge>}
            </button>
          );
        })}
        {!loading && !conversations.length && <EmptyState icon={MessageSquarePlus} title="No conversations yet" description="Start from a member profile when you want to message someone." />}
      </div>
    </div>
  );
}
