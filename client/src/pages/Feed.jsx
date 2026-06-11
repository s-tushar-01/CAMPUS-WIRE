import { useEffect, useState } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import { Card, CardContent } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import StatusBanner from '../components/ui/StatusBanner';

const feedFilters = [
  { value: 'all', label: 'All' },
  { value: 'following', label: 'Following' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'mine', label: 'Mine' },
];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [welcome, setWelcome] = useState(() => sessionStorage.getItem('welcomeBack') || '');

  const load = async (nextPage = 1, nextFilter = filter) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/posts/feed?page=${nextPage}&limit=10&filter=${nextFilter}`);
      setPosts((current) => nextPage === 1 ? data.posts || [] : [...current, ...(data.posts || [])]);
      setPage(data.currentPage || nextPage);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, filter);
  }, [filter]);

  const clearWelcome = () => {
    sessionStorage.removeItem('welcomeBack');
    setWelcome('');
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="bg-gradient-to-br from-indigo-600 to-slate-900 p-5 text-white">
            <Badge className="bg-white/18 text-white">Closed campus network</Badge>
            <h1 className="mt-3 text-2xl font-extrabold">Good to see you on CampusWire.</h1>
            <p className="mt-2 max-w-xl text-sm text-indigo-100">Share updates, follow your community, and keep up with announcements in one private space.</p>
          </CardContent>
        </Card>
        {welcome && <StatusBanner tone="success" title={welcome}><button className="font-bold underline" onClick={clearWelcome}>Dismiss</button></StatusBanner>}
        <CreatePost onCreated={(post) => setPosts((current) => [post, ...current])} />
        <Card>
          <CardContent className="flex flex-wrap gap-2 py-3">
            {feedFilters.map((item) => (
              <button
                key={item.value}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${filter === item.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                onClick={() => {
                  setPosts([]);
                  setFilter(item.value);
                }}
              >
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>
        {loading && posts.length === 0 && <FeedSkeleton />}
        {!loading && posts.length === 0 && <EmptyFeed />}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))}
            onUpdated={(nextPost) => setPosts((current) => current.map((item) => item._id === nextPost._id ? nextPost : item))}
            onShared={(sharedPost) => setPosts((current) => [sharedPost, ...current])}
          />
        ))}
        {page < totalPages && (
          <button className="surface w-full rounded-card p-3 text-sm font-semibold text-primary" onClick={() => load(page + 1)} disabled={loading}>
            {loading ? 'Loading...' : 'Load more posts'}
          </button>
        )}
      </div>
    </AppShell>
  );
}

function FeedSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-44" /><Skeleton className="h-72" /></div>;
}

function EmptyFeed() {
  return <EmptyState title="Your feed is quiet" description="Follow people, write your first post, or wait for admin broadcasts to see updates here." />;
}
