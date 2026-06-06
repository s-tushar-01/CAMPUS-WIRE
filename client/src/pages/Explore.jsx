import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import UserCard from '../components/users/UserCard';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Form';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('suggestions');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        setUsers(data.users || []);
        setMode('search');
      } else {
        const { data } = await api.get('/api/users/suggestions');
        setUsers(data.users || []);
        setMode('suggestions');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-extrabold">Explore people</h1>
          <p className="text-sm text-slate-500">Find classmates, faculty, clubs, and active community members.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" />
          </div>
          <h2 className="text-sm font-bold text-slate-500">{mode === 'search' ? 'Search results' : 'Suggested for you'}</h2>
          <div className="space-y-3">
            {users.map((user) => <UserCard key={user._id} user={user} />)}
            {!users.length && <p className="text-sm text-slate-500">No users found.</p>}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
