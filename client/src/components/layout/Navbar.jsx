import { Bell, Home, LogOut, MessageSquare, Moon, Search, Sun, UserRound } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Logo from '../brand/Logo';
import { profilePath, usernameHandle } from '../../lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!user) return undefined;
    const load = async () => {
      try {
        const { data } = await api.get('/api/notifications');
        setUnread(data.unreadCount || 0);
      } catch {
        setUnread(0);
      }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const doLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-3 md:px-5">
        <Logo hideTextOnMobile />
        <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search classmates, faculty, announcements" onFocus={() => navigate('/explore')} />
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          <NavIcon to="/" icon={Home} />
          <NavIcon to="/messages" icon={MessageSquare} />
          <NavIcon to="/notifications" icon={Bell} badge={unread} />
        </nav>
        <Button variant="ghost" size="icon" onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {user && (
          <div className="group relative">
            <button className="focus-ring rounded-full" aria-label="User menu">
              <Avatar user={user} />
            </button>
            <div className="surface invisible absolute right-0 top-12 w-56 rounded-card p-2 opacity-0 shadow-float transition group-hover:visible group-hover:opacity-100">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-bold">{user.name}</p>
                {usernameHandle(user) && <p className="truncate text-xs font-semibold text-primary">{usernameHandle(user)}</p>}
              </div>
              <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800" to={profilePath(user)}>
                <UserRound className="h-4 w-4" /> Profile
              </Link>
              {user.role === 'admin' && <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800" to="/admin">Admin Panel</Link>}
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-error hover:bg-red-50 dark:hover:bg-red-950/40" onClick={doLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavIcon({ to, icon: Icon, badge }) {
  return (
    <NavLink to={to} className={({ isActive }) => `relative grid h-10 w-10 place-items-center rounded-lg transition ${isActive ? 'bg-indigo-50 text-primary dark:bg-indigo-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <Icon className="h-5 w-5" />
      {!!badge && <Badge className="absolute -right-1 -top-1 px-1.5 py-0 text-[10px]">{badge}</Badge>}
    </NavLink>
  );
}
