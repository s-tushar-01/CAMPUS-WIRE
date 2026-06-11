import { Bell, Compass, Home, MessageSquare, Shield, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { profilePath, usernameHandle } from '../../lib/utils';

export default function LeftSidebar() {
  const { user } = useAuth();
  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: profilePath(user), label: 'Profile', icon: UserRound },
  ];
  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin Panel', icon: Shield });

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] lg:block">
      <div className="surface rounded-card p-3">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{usernameHandle(user) || (user?.role === 'admin' ? 'Administrator' : 'Community member')}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={label} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-indigo-50 text-primary dark:bg-indigo-950/60' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
