import { Bell, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export default function Notifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/api/notifications');
      setItems(data.notifications || []);
      await api.put('/api/notifications/read');
    }
    load();
  }, []);

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <h1 className="flex items-center gap-2 text-xl font-extrabold"><Bell className="h-5 w-5 text-primary" /> Notifications</h1>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <Link key={item._id} to={item.type === 'follow' ? `/profile/${item.sender?._id}` : '/'} className="flex gap-3 rounded-lg border border-slate-200/70 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
              {item.type === 'broadcast' ? <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700"><Megaphone className="h-5 w-5" /></div> : <Avatar user={item.sender} />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{label(item)}</p>
                <p className="text-xs text-slate-500">{format(item.createdAt)}</p>
              </div>
              {!item.isRead && <Badge>New</Badge>}
            </Link>
          ))}
          {!items.length && <p className="py-10 text-center text-sm text-slate-500">No notifications yet.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function label(item) {
  if (item.type === 'broadcast') return `Announcement: ${item.message || 'New campus announcement'}`;
  if (item.type === 'like') return `${item.sender?.name || 'Someone'} liked your post`;
  if (item.type === 'comment') return `${item.sender?.name || 'Someone'} commented on your post`;
  if (item.type === 'follow') return `${item.sender?.name || 'Someone'} started following you`;
  return 'New notification';
}
