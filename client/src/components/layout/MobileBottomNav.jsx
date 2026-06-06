import { Compass, Home, MessageSquare, PlusCircle, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/', icon: PlusCircle, label: 'Create' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: `/profile/${user?._id}`, icon: UserRound, label: 'Profile' },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink key={label} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-semibold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
