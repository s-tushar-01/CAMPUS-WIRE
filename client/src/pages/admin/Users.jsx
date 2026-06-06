import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const load = async () => {
    const params = new URLSearchParams({ limit: '50' });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    const { data } = await api.get(`/api/admin/users?${params}`);
    setUsers(data.users || []);
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, role]);

  const toggle = async (id) => {
    try {
      const { data } = await api.put(`/api/admin/users/${id}/status`);
      setUsers((current) => current.map((user) => user._id === id ? { ...user, isActive: data.isActive } : user));
      toast.success(data.message);
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user and their content?')) return;
    await api.delete(`/api/admin/users/${id}`);
    setUsers((current) => current.filter((user) => user._id !== id));
  };

  return (
    <Card>
      <CardHeader><h1 className="text-xl font-extrabold">User Management</h1></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" /></div>
          <Select value={role} onChange={(event) => setRole(event.target.value)}><option value="">All roles</option><option value="participant">Participant</option><option value="admin">Admin</option></Select>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Joined</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="p-3"><div className="flex items-center gap-3"><Avatar user={user} /><div><p className="font-bold">{user.name}</p><p className="text-slate-500">{user.email}</p></div></div></td>
                  <td className="p-3"><Badge variant={user.role === 'admin' ? 'default' : 'muted'}>{user.role}</Badge></td>
                  <td className="p-3"><Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="p-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right"><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => toggle(user._id)}>{user.isActive ? 'Deactivate' : 'Activate'}</Button><Button variant="danger" size="sm" onClick={() => remove(user._id)}>Delete</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
