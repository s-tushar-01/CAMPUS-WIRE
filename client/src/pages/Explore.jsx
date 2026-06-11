import { Heart, Image, MessageCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import FollowButton from '../components/users/FollowButton';
import { imageUrl } from '../lib/utils';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [mode, setMode] = useState('suggestions');
  const [loadingPosts, setLoadingPosts] = useState(true);

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

  useEffect(() => {
    async function loadPosts() {
      setLoadingPosts(true);
      try {
        const { data } = await api.get('/api/posts/feed?page=1&limit=30&filter=all');
        setPosts(data.posts || []);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <AppShell right={false}>
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search classmates and creators" />
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-xl font-extrabold">{mode === 'search' ? 'Search' : 'Explore'}</h1>
              <Badge variant="muted">{mode === 'search' ? `${users.length} people` : 'Campus discover'}</Badge>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {users.map((user) => <ProfileBubble key={user._id} user={user} />)}
              {!users.length && <p className="py-6 text-sm text-slate-500">No people found.</p>}
            </div>
          </CardContent>
        </Card>

        {mode === 'search' && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => <SearchResult key={user._id} user={user} />)}
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-500">
              <Image className="h-4 w-4" />
              Campus posts
            </h2>
            <span className="text-xs font-semibold text-slate-400">{posts.length} posts</span>
          </div>

          {loadingPosts && <div className="grid grid-cols-3 gap-1 sm:gap-2">{Array.from({ length: 9 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-md bg-slate-100 dark:bg-slate-900" />)}</div>}
          {!loadingPosts && !posts.length && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-slate-500">No campus posts to explore yet.</CardContent>
            </Card>
          )}
          {!loadingPosts && !!posts.length && (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {posts.map((post, index) => <ExploreTile key={post._id} post={post} featured={index % 11 === 0} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ProfileBubble({ user }) {
  return (
    <Link to={`/profile/${user._id}`} className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center">
      <span className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-primary p-[2px]">
        <span className="block rounded-full bg-white p-0.5 dark:bg-slate-950">
          <Avatar user={user} size="lg" />
        </span>
      </span>
      <span className="line-clamp-2 text-xs font-bold leading-4 group-hover:text-primary">{user.name}</span>
    </Link>
  );
}

function SearchResult({ user }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <Link to={`/profile/${user._id}`}><Avatar user={user} /></Link>
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${user._id}`} className="block truncate text-sm font-bold hover:text-primary">{user.name}</Link>
          <p className="truncate text-xs text-slate-500">{user.bio || user.email || 'Campus member'}</p>
        </div>
        <FollowButton userId={user._id} />
      </CardContent>
    </Card>
  );
}

function ExploreTile({ post, featured }) {
  const hasImage = !!imageUrl(post.image);
  const reactions = post.reactions?.length || post.likes?.length || 0;
  const comments = (post.comments || []).reduce((sum, item) => sum + 1 + (item.replies?.length || 0), 0);

  return (
    <Link
      to={`/profile/${post.author?._id}`}
      className={`group relative overflow-hidden rounded-md bg-slate-100 dark:bg-slate-900 ${featured ? 'col-span-2 row-span-2' : ''}`}
    >
      <div className="aspect-square h-full w-full">
        {hasImage ? (
          <img src={imageUrl(post.image)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col justify-between bg-gradient-to-br from-slate-100 to-indigo-100 p-3 dark:from-slate-900 dark:to-indigo-950/50">
            <p className="line-clamp-6 text-sm font-bold leading-5 text-slate-700 dark:text-slate-100">{post.content || 'CampusWire post'}</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Avatar user={post.author} size="sm" />
              <span className="truncate">{post.author?.name}</span>
            </div>
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex flex-col justify-between bg-slate-950/0 p-3 text-white opacity-0 transition group-hover:bg-slate-950/55 group-hover:opacity-100">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Avatar user={post.author} size="sm" />
          <span className="truncate">{post.author?.name || 'Member'}</span>
        </div>
        <div>
          <div className="flex items-center justify-center gap-5 text-sm font-bold">
            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{reactions}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{comments}</span>
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-white/80">{post.createdAt ? format(post.createdAt) : 'Campus post'}</p>
        </div>
      </div>
    </Link>
  );
}
