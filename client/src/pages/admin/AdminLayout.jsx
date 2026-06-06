import { BarChart3, Megaphone, Newspaper, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();
  const links = [
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/posts', label: 'Posts', icon: Newspaper },
    { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  ];

  return (
    <AppShell compact>
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="surface rounded-card p-3">
          <div className="mb-4 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Admin Panel</p>
            <h1 className="text-lg font-extrabold">{user?.name}</h1>
          </div>
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={label} to={to} end={to === '/admin'} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-indigo-50 text-primary dark:bg-indigo-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <Outlet />
      </div>
    </AppShell>
  );
}
