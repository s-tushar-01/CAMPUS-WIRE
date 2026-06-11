import {
  Eye,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  PartyPopper,
  Repeat2,
  Share2,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input, Select, Textarea } from '../ui/Form';
import Modal from '../ui/Modal';
import { imageUrl, unwrapApi } from '../../lib/utils';

const REACTIONS = [
  { type: 'like', label: 'Like', icon: ThumbsUp, className: 'text-primary' },
  { type: 'love', label: 'Love', icon: Heart, className: 'text-rose-500' },
  { type: 'celebrate', label: 'Celebrate', icon: PartyPopper, className: 'text-amber-500' },
  { type: 'helpful', label: 'Helpful', icon: Lightbulb, className: 'text-emerald-500' },
  { type: 'curious', label: 'Curious', icon: HelpCircle, className: 'text-sky-500' },
];

const audienceLabels = {
  campus: 'Campus',
  followers: 'Followers',
  friends: 'Friends',
  private: 'Only me',
};

function mentionFor(user) {
  const name = user?.name || 'Member';
  return `@${name.trim().replace(/\s+/g, '')}`;
}

export default function PostCard({ post, onDelete, onUpdated, onShared }) {
  const { user } = useAuth();
  const [local, setLocal] = useState(post);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareText, setShareText] = useState('');
  const [shareAudience, setShareAudience] = useState('campus');
  const [busyReaction, setBusyReaction] = useState('');
  const canDelete = user?._id === local.author?._id || user?.role === 'admin';

  const reactionSummary = useMemo(() => {
    const counts = {};
    (local.reactions || []).forEach((reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    if (!local.reactions?.length && local.likes?.length) counts.like = local.likes.length;
    return counts;
  }, [local.reactions, local.likes]);

  const myReaction = useMemo(() => {
    const found = (local.reactions || []).find((reaction) => String(reaction.user) === String(user?._id));
    if (found) return found.type;
    if ((local.likes || []).some((id) => String(id) === String(user?._id))) return 'like';
    return '';
  }, [local.reactions, local.likes, user?._id]);

  const totalReactions = Object.values(reactionSummary).reduce((sum, count) => sum + count, 0);
  const totalComments = (local.comments || []).reduce((sum, item) => sum + 1 + (item.replies?.length || 0), 0);
  const activeReaction = REACTIONS.find((reaction) => reaction.type === myReaction) || REACTIONS[0];
  const ActiveIcon = activeReaction.icon;

  const react = async (type) => {
    setBusyReaction(type);
    try {
      const { data } = await api.put(`/api/posts/${local._id}/reaction`, { type });
      setLocal(data.post);
      onUpdated?.(data.post);
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setBusyReaction('');
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/api/posts/${local._id}/comment`, { text: comment.trim() });
      const next = { ...local, comments: data.comments };
      setLocal(next);
      setComment('');
      onUpdated?.(next);
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/posts/${local._id}/comment/${commentId}`);
      const next = { ...local, comments: (local.comments || []).filter((item) => item._id !== commentId) };
      setLocal(next);
      onUpdated?.(next);
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const addReply = async (event, commentId) => {
    event.preventDefault();
    if (!replyText.trim()) return;
    try {
      const commentItem = (local.comments || []).find((item) => item._id === commentId);
      const mention = mentionFor(commentItem?.user);
      const trimmed = replyText.trim();
      const text = trimmed.startsWith(mention) ? trimmed : `${mention} ${trimmed}`;
      const { data } = await api.post(`/api/posts/${local._id}/comment/${commentId}/reply`, { text });
      const next = { ...local, comments: data.comments };
      setLocal(next);
      setReplyText('');
      setReplyingTo('');
      onUpdated?.(next);
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const deleteReply = async (commentId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      const { data } = await api.delete(`/api/posts/${local._id}/comment/${commentId}/reply/${replyId}`);
      const next = { ...local, comments: data.comments };
      setLocal(next);
      onUpdated?.(next);
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const share = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/api/posts/${local._id}/share`, {
        content: shareText.trim(),
        audience: shareAudience,
      });
      onShared?.(data.post);
      setSharing(false);
      setShareText('');
      setShareAudience('campus');
      toast.success('Post shared');
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
    <>
      <Card className="overflow-hidden">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${local.author?._id}`}><Avatar user={local.author} /></Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/profile/${local.author?._id}`} className="font-bold hover:text-primary">{local.author?.name || 'CampusWire user'}</Link>
                {local.author?.role === 'admin' && <Badge>Admin</Badge>}
                {local.isBroadcast && <Badge variant="warning">Announcement</Badge>}
                {local.shareOf && <Badge variant="muted"><Repeat2 className="h-3 w-3" /> Shared</Badge>}
              </div>
              <p className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                {format(local.createdAt)}
                <span aria-hidden="true">.</span>
                <Eye className="h-3 w-3" />
                {audienceLabels[local.audience] || 'Campus'}
              </p>
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
          {local.shareOf && <SharedPostPreview post={local.shareOf} />}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm text-slate-500 dark:border-slate-800">
            <ReactionSummary counts={reactionSummary} total={totalReactions} />
            <button className="hover:text-primary" onClick={() => setCommentsOpen((value) => !value)}>
              {totalComments} comments
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 border-t border-slate-200 pt-2 dark:border-slate-800">
            <div className="group relative">
              <Button variant="ghost" className={myReaction ? activeReaction.className : ''} disabled={!!busyReaction} onClick={() => react(myReaction || 'like')}>
                <ActiveIcon className="h-4 w-4" />
                {myReaction ? activeReaction.label : 'Like'}
              </Button>
              <div className="invisible absolute bottom-10 left-0 z-10 flex rounded-full border border-slate-200 bg-white p-1 opacity-0 shadow-float transition group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
                {REACTIONS.map(({ type, label, icon: Icon, className }) => (
                  <button key={type} className={`grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`} onClick={() => react(type)} aria-label={label} title={label}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" onClick={() => setCommentsOpen((value) => !value)}>
              <MessageCircle className="h-4 w-4" />
              Comment
            </Button>
            <Button variant="ghost" onClick={() => setSharing(true)}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {commentsOpen && (
            <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              {(local.comments || []).map((item) => {
                const canDeleteComment = user?._id === item.user?._id || user?._id === local.author?._id || user?.role === 'admin';
                return (
                  <div key={item._id} className="space-y-2">
                    <div className="flex gap-2">
                      <Avatar user={item.user} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold">{item.user?.name || 'Member'}</p>
                              <p className="text-xs text-slate-500">{format(item.createdAt)}</p>
                            </div>
                            {canDeleteComment && (
                              <button className="text-slate-400 hover:text-error" onClick={() => deleteComment(item._id)} aria-label="Delete comment">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="mt-1 whitespace-pre-wrap">{item.text}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-3 px-2 text-xs font-semibold text-slate-500">
                          <button className="hover:text-primary" onClick={() => {
                            setReplyingTo((current) => {
                              const opening = current !== item._id;
                              setReplyText(opening ? `${mentionFor(item.user)} ` : '');
                              return opening ? item._id : '';
                            });
                          }}>
                            Reply
                          </button>
                          {!!item.replies?.length && <span>{item.replies.length} replies</span>}
                        </div>
                      </div>
                    </div>
                    {!!item.replies?.length && (
                      <div className="ml-10 space-y-2 border-l border-slate-200 pl-3 dark:border-slate-800">
                        {item.replies.map((reply) => {
                          const canDeleteReply =
                            user?._id === reply.user?._id ||
                            user?._id === item.user?._id ||
                            user?._id === local.author?._id ||
                            user?.role === 'admin';
                          return (
                            <div key={reply._id} className="flex gap-2">
                              <Avatar user={reply.user} size="sm" />
                              <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold">{reply.user?.name || 'Member'}</p>
                                    <p className="text-xs text-slate-500">{format(reply.createdAt)}</p>
                                  </div>
                                  {canDeleteReply && (
                                    <button className="text-slate-400 hover:text-error" onClick={() => deleteReply(item._id, reply._id)} aria-label="Delete reply">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                                <p className="mt-1 whitespace-pre-wrap">{reply.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {replyingTo === item._id && (
                      <form onSubmit={(event) => addReply(event, item._id)} className="ml-10 flex gap-2">
                        <Input value={replyText} onChange={(event) => setReplyText(event.target.value.slice(0, 500))} placeholder={`Reply to ${mentionFor(item.user)}`} />
                        <Button type="submit" disabled={!replyText.trim()}>Reply</Button>
                      </form>
                    )}
                  </div>
                );
              })}
              {!local.comments?.length && <p className="rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500 dark:bg-slate-900">No comments yet.</p>}
              <form onSubmit={addComment} className="flex gap-2">
                <Input value={comment} onChange={(event) => setComment(event.target.value.slice(0, 500))} placeholder="Write a comment" />
                <Button type="submit">Send</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={sharing} title="Share post" onClose={() => setSharing(false)}>
        <form onSubmit={share} className="space-y-3">
          <Textarea value={shareText} onChange={(event) => setShareText(event.target.value.slice(0, 500))} placeholder="Say something about this post" />
          <Select value={shareAudience} onChange={(event) => setShareAudience(event.target.value)}>
            <option value="campus">Campus</option>
            <option value="followers">Followers</option>
            <option value="friends">Friends</option>
            <option value="private">Only me</option>
          </Select>
          <SharedPostPreview post={local} compact />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSharing(false)}>Cancel</Button>
            <Button type="submit">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function ReactionSummary({ counts, total }) {
  if (!total) return <span>Be the first to react</span>;
  const visible = REACTIONS.filter((reaction) => counts[reaction.type]).slice(0, 3);
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        {visible.map(({ type, label, icon: Icon, className }) => (
          <span key={type} className={`grid h-6 w-6 place-items-center rounded-full border border-white bg-slate-100 dark:border-slate-950 dark:bg-slate-800 ${className}`} title={label}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        ))}
      </div>
      <span>{total}</span>
    </div>
  );
}

function SharedPostPreview({ post, compact = false }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-2">
        <Avatar user={post.author} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{post.author?.name || 'CampusWire user'}</p>
          <p className="text-xs text-slate-500">{post.createdAt ? format(post.createdAt) : 'Original post'}</p>
        </div>
      </div>
      {post.content && <p className={`whitespace-pre-wrap px-3 pb-3 text-sm text-slate-700 dark:text-slate-200 ${compact ? 'line-clamp-3' : ''}`}>{post.content}</p>}
      {imageUrl(post.image) && <img src={imageUrl(post.image)} alt="Shared post attachment" loading="lazy" className="max-h-80 w-full object-cover" />}
    </div>
  );
}
