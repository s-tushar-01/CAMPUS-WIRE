import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { usernameHandle, unwrapApi } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import StatusBanner from '../../components/ui/StatusBanner';

export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/api/admin/posts?limit=50').then(({ data }) => setPosts(data.posts || []));
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/admin/posts/${id}`);
      setPosts((current) => current.filter((post) => post._id !== id));
      toast.success('Post deleted');
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  return (
    <Card>
      <CardHeader><h1 className="text-xl font-extrabold">Post Moderation</h1></CardHeader>
      <CardContent className="space-y-4 overflow-auto">
        <div className="grid gap-3 md:grid-cols-4">
          {['Pending', 'Reviewed', 'Dismissed', 'Actioned'].map((status) => <button key={status} className="rounded-card bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{status} reports</button>)}
        </div>
        <StatusBanner title="Report review shell">Reports can be reviewed here once the report API is added. Current table still moderates live posts.</StatusBanner>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Author</th><th className="p-3">Content</th><th className="p-3">Media</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3"><div className="flex items-center gap-3"><Avatar user={post.author} /><div><p className="font-bold">{post.author?.name}</p>{usernameHandle(post.author) && <p className="text-xs font-semibold text-primary">{usernameHandle(post.author)}</p>}</div></div></td>
                <td className="max-w-md p-3 text-slate-600 dark:text-slate-300">{post.content?.slice(0, 110) || 'Image post'}{post.isBroadcast && <Badge variant="warning" className="ml-2">Broadcast</Badge>}</td>
                <td className="p-3">{post.image?.url ? 'Image' : 'None'}</td>
                <td className="p-3 text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right"><Button variant="danger" size="sm" onClick={() => remove(post._id)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!posts.length && <EmptyState title="No posts to moderate" description="New posts and future reports will appear here." />}
      </CardContent>
    </Card>
  );
}
