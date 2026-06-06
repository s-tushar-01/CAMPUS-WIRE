import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { unwrapApi } from '../../lib/utils';

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
      <CardContent className="overflow-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Author</th><th className="p-3">Content</th><th className="p-3">Media</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-3"><div className="flex items-center gap-3"><Avatar user={post.author} /><span className="font-bold">{post.author?.name}</span></div></td>
                <td className="max-w-md p-3 text-slate-600 dark:text-slate-300">{post.content?.slice(0, 110) || 'Image post'}{post.isBroadcast && <Badge variant="warning" className="ml-2">Broadcast</Badge>}</td>
                <td className="p-3">{post.image?.url ? 'Image' : 'None'}</td>
                <td className="p-3 text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right"><Button variant="danger" size="sm" onClick={() => remove(post._id)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
