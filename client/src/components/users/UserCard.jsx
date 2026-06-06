import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import FollowButton from './FollowButton';
import { useAuth } from '../../context/AuthContext';

export default function UserCard({ user, compact = false, following = false, onFollowChange }) {
  const { user: me } = useAuth();
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <Link to={`/profile/${user._id}`}>
        <Avatar user={user} size={compact ? 'md' : 'lg'} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${user._id}`} className="block truncate text-sm font-bold hover:text-primary">
          {user.name}
        </Link>
        {!compact && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email || user.bio || 'Campus community member'}</p>}
        {compact && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.bio || 'Suggested connection'}</p>}
      </div>
      {me?._id !== user._id && <FollowButton userId={user._id} initialFollowing={following} onChange={onFollowChange} />}
    </div>
  );
}
