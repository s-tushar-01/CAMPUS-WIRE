import { MessageSquare, Newspaper, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { usernameHandle } from '../../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    api.get('/api/admin/stats').then(({ data }) => {
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
    });
  }, []);

  const cards = [
    { label: 'Total users', value: stats?.totalUsers || 0, icon: Users },
    { label: 'Total posts', value: stats?.totalPosts || 0, icon: Newspaper },
    { label: 'Messages', value: stats?.totalMessages || 0, icon: MessageSquare },
    { label: 'New users today', value: stats?.newUsersToday || 0, icon: UserPlus },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-extrabold">{value}</p></div>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-primary dark:bg-indigo-950"><Icon className="h-6 w-6" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><h2 className="font-bold">User growth</h2></CardHeader>
        <CardContent>
          <div className="flex h-52 items-end gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
            {[38, 52, 44, 72, 66, 88, 78].map((height, index) => <div key={index} className="flex-1 rounded-t-lg bg-primary/80" style={{ height: `${height}%` }} />)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="font-bold">Recent users</h2></CardHeader>
        <CardContent className="space-y-3">
          {recentUsers.map((user) => (
            <div key={user._id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
              <Avatar user={user} />
              <div className="min-w-0"><p className="truncate font-bold">{user.name}</p>{usernameHandle(user) && <p className="truncate text-sm font-semibold text-primary">{usernameHandle(user)}</p>}<p className="text-sm text-slate-500">{user.email}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
