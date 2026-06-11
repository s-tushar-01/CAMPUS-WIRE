import { Grid3X3, List, MessageCircle, MessageSquare, ThumbsUp, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowButton from '../components/users/FollowButton';
import PostCard from '../components/posts/PostCard';
import Skeleton from '../components/ui/Skeleton';
import { imageUrl, profilePath, usernameHandle } from '../lib/utils';

export default function Profile() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [connections, setConnections] = useState(null);
  const [postView, setPostView] = useState('grid');
  const own = me?._id === userId;

  useEffect(() => {
    Promise.all([
      api.get(`/api/users/${userId}`),
      api.get(`/api/posts/user/${userId}?limit=60`),
    ]).then(([userRes, postsRes]) => {
      setProfile(userRes.data.user);
      setFollowing(userRes.data.isFollowing);
      setPosts(postsRes.data.posts || []);
    });
  }, [userId]);

  if (!profile) return <AppShell><Skeleton className="h-[420px]" /></AppShell>;

  const updateFollowState = (data) => {
    setFollowing(data.following);
    setProfile((current) => {
      if (!current || !me) return current;
      const followers = current.followers || [];
      return {
        ...current,
        followers: data.following
          ? [...followers.filter((item) => item._id !== me._id), me]
          : followers.filter((item) => item._id !== me._id),
      };
    });
  };

  const saveProfile = (nextProfile) => {
    setProfile((current) => ({
      ...current,
      ...nextProfile,
      followers: current?.followers || nextProfile.followers || [],
      following: current?.following || nextProfile.following || [],
    }));
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-indigo-500 via-slate-700 to-slate-950">
            {imageUrl(profile.coverPic) && <img src={imageUrl(profile.coverPic)} alt="" className="h-full w-full object-cover" />}
          </div>
          <CardContent>
            <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar user={profile} size="xl" />
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold">{profile.name}</h1>
                    {profile.role === 'admin' && <Badge>Admin</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{profile.bio || 'Campus community member'}</p>
                  {usernameHandle(profile) && <p className="text-sm font-semibold text-primary">{usernameHandle(profile)}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                {own ? (
                  <Button onClick={() => setEditing(true)}>Edit profile</Button>
                ) : (
                  <>
                    <FollowButton userId={profile._id} initialFollowing={following} onChange={updateFollowState} />
                    <Link to={`/messages?userId=${profile._id}`} className="focus-ring inline-flex h-8 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-900">
              <Stat label="Posts" value={posts.length} />
              <Stat label="Followers" value={profile.followers?.length || 0} onClick={() => setConnections({ title: 'Followers', users: profile.followers || [] })} />
              <Stat label="Following" value={profile.following?.length || 0} onClick={() => setConnections({ title: 'Following', users: profile.following || [] })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold"><UserPlus className="h-4 w-4 text-primary" /> Posts</div>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
              <button className={`grid h-8 w-8 place-items-center rounded-md ${postView === 'grid' ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-slate-500'}`} onClick={() => setPostView('grid')} aria-label="Grid view">
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button className={`grid h-8 w-8 place-items-center rounded-md ${postView === 'feed' ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-slate-500'}`} onClick={() => setPostView('feed')} aria-label="Feed view">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          <CardContent>
            {postView === 'grid' && !!posts.length && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {posts.map((post) => <PostTile key={post._id} post={post} />)}
              </div>
            )}
            {postView === 'feed' && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))}
                    onUpdated={(nextPost) => setPosts((current) => current.map((item) => item._id === nextPost._id ? nextPost : item))}
                    onShared={(sharedPost) => setPosts((current) => [sharedPost, ...current])}
                  />
                ))}
              </div>
            )}
            {!posts.length && <div className="py-8 text-center text-sm text-slate-500">No posts yet.</div>}
          </CardContent>
        </Card>
      </div>
      <EditProfileModal open={editing} onClose={() => setEditing(false)} profile={profile} onSaved={saveProfile} />
      <ConnectionsModal open={!!connections} title={connections?.title} users={connections?.users || []} currentUserId={me?._id} onClose={() => setConnections(null)} />
    </AppShell>
  );
}

function Stat({ label, value, onClick }) {
  const content = <><p className="text-lg font-extrabold">{value}</p><p className="text-xs text-slate-500">{label}</p></>;
  if (!onClick) return <div>{content}</div>;
  return <button className="rounded-md py-1 transition hover:bg-white dark:hover:bg-slate-800" onClick={onClick}>{content}</button>;
}

function ConnectionsModal({ open, title, users, currentUserId, onClose }) {
  return (
    <Modal open={open} title={title || 'People'} onClose={onClose}>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user._id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-900">
            <Link to={profilePath(user)} onClick={onClose}><Avatar user={user} /></Link>
            <div className="min-w-0 flex-1">
              <Link to={profilePath(user)} onClick={onClose} className="block truncate text-sm font-bold hover:text-primary">{user.name}</Link>
              <p className="truncate text-xs text-slate-500">{usernameHandle(user) || user.bio || 'Campus community member'}</p>
            </div>
            {currentUserId !== user._id && (
              <Link to={`/messages?userId=${user._id}`} onClick={onClose} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`Message ${user.name}`}>
                <MessageSquare className="h-4 w-4" />
              </Link>
            )}
          </div>
        ))}
        {!users.length && <p className="py-6 text-center text-sm text-slate-500">No people yet.</p>}
      </div>
    </Modal>
  );
}

function PostTile({ post }) {
  const hasImage = !!imageUrl(post.image);
  const reactionCount = post.reactions?.length || post.likes?.length || 0;
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
      {hasImage ? (
        <img src={imageUrl(post.image)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
      ) : (
        <div className="flex h-full items-center p-4 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
          <p className="line-clamp-6">{post.content || 'CampusWire post'}</p>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center gap-5 bg-slate-950/0 text-sm font-bold text-white opacity-0 transition group-hover:bg-slate-950/55 group-hover:opacity-100">
        <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{reactionCount}</span>
        <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{post.comments?.length || 0}</span>
      </div>
    </div>
  );
}
