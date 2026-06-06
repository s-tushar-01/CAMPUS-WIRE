import { Activity, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import UserCard from '../users/UserCard';
import Badge from '../ui/Badge';

export default function RightSidebar() {
  const [users, setUsers] = useState([]);
  const { onlineUsers } = useSocket();

  useEffect(() => {
    api.get('/api/users/suggestions').then(({ data }) => setUsers(data.users || [])).catch(() => setUsers([]));
  }, []);

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] space-y-4 overflow-auto xl:block">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <h2 className="font-bold">Suggested people</h2>
          <Badge variant="muted">{users.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length ? users.map((user) => <UserCard key={user._id} user={user} compact />) : <p className="text-sm text-slate-500">No new suggestions yet.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 font-bold"><Activity className="h-4 w-4 text-primary" /> Community activity</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Announcements and posts from people you follow appear in your feed.</p>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-success text-success" />
            {onlineUsers.size} online now
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
