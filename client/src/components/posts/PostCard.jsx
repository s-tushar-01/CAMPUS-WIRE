import { MessageCircle, MoreHorizontal, Share2, ThumbsUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Form';
import { imageUrl, unwrapApi } from '../../lib/utils';

export default function PostCard({ post, onDelete, onUpdated }) {
  const { user } = useAuth();
  const [local, setLocal] = useState(post);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const liked = local.likes?.some((id) => String(id) === String(user?._id));
  const canDelete = user?._id === local.author?._id || user?.role === 'admin';

  const like = async () => {
    try {
      const { data } = await api.put(`/api/posts/${local._id}/like`);
      const nextLikes = data.isLiked ? [...(local.likes || []), user._id] : (local.likes || []).filter((id) => String(id) !== String(user._id));
      setLocal({ ...local, likes: nextLikes });
      onUpdated?.({ ...local, likes: nextLikes });
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/api/posts/${local._id}/comment`, { text: comment.trim() });
      setLocal({ ...local, comments: data.comments });
      setComment('');
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${local._id}`);
      onDelete?.(local._id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${local.author?._id}`}><Avatar user={local.author} /></Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/profile/${local.author?._id}`} className="font-bold hover:text-primary">{local.author?.name || 'CampusWire user'}</Link>
              {local.author?.role === 'admin' && <Badge>Admin</Badge>}
              {local.isBroadcast && <Badge variant="warning">Announcement</Badge>}
            </div>
            <p className="text-xs text-slate-500">{format(local.createdAt)}</p>
          </div>
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={remove} aria-label="Delete post">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {!canDelete && <MoreHorizontal className="h-5 w-5 text-slate-400" />}
        </div>
        {local.content && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{local.content}</p>}
        {imageUrl(local.image) && <img src={imageUrl(local.image)} alt="Post attachment" loading="lazy" className="max-h-[560px] w-full rounded-lg object-cover" />}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
          <Button variant="ghost" onClick={like} className={liked ? 'text-primary' : ''}>
            <ThumbsUp className="h-4 w-4" />
            {local.likes?.length || 0}
          </Button>
          <Button variant="ghost" onClick={() => setCommentsOpen((v) => !v)}>
            <MessageCircle className="h-4 w-4" />
            {local.comments?.length || 0}
          </Button>
          <Button variant="ghost">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        {commentsOpen && (
          <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
            {(local.comments || []).map((item) => (
              <div key={item._id} className="flex gap-2">
                <Avatar user={item.user} size="sm" />
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                  <p className="font-semibold">{item.user?.name || 'Member'}</p>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
            <form onSubmit={addComment} className="flex gap-2">
              <Input value={comment} onChange={(event) => setComment(event.target.value.slice(0, 500))} placeholder="Write a comment" />
              <Button type="submit">Send</Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
