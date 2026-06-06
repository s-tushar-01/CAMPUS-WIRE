import { useEffect, useState } from 'react';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import { Card, CardContent } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/posts/feed?page=${nextPage}&limit=10`);
      setPosts((current) => nextPage === 1 ? data.posts || [] : [...current, ...(data.posts || [])]);
      setPage(data.currentPage || nextPage);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

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
        <CreatePost onCreated={(post) => setPosts((current) => [post, ...current])} />
        {loading && posts.length === 0 && <FeedSkeleton />}
        {!loading && posts.length === 0 && <EmptyFeed />}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))} />
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
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <h2 className="font-bold">Your feed is quiet</h2>
        <p className="mt-2 text-sm text-slate-500">Follow people or wait for admin broadcasts to see updates here.</p>
      </CardContent>
    </Card>
  );
}
