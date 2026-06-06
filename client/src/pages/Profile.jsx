import { MessageSquare, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowButton from '../components/users/FollowButton';
import PostCard from '../components/posts/PostCard';
import Skeleton from '../components/ui/Skeleton';
import { imageUrl } from '../lib/utils';

export default function Profile() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const own = me?._id === userId;

  useEffect(() => {
    Promise.all([
      api.get(`/api/users/${userId}`),
      api.get(`/api/posts/user/${userId}`),
    ]).then(([userRes, postsRes]) => {
      setProfile(userRes.data.user);
      setFollowing(userRes.data.isFollowing);
      setPosts(postsRes.data.posts || []);
    });
  }, [userId]);

  if (!profile) return <AppShell><Skeleton className="h-[420px]" /></AppShell>;

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
                </div>
              </div>
              <div className="flex gap-2">
                {own ? <Button onClick={() => setEditing(true)}>Edit profile</Button> : <>
                  <FollowButton userId={profile._id} initialFollowing={following} onChange={(data) => setFollowing(data.following)} />
                  <Link to={`/messages?userId=${profile._id}`} className="focus-ring inline-flex h-8 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Link>
                </>}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-900">
              <Stat label="Followers" value={profile.followers?.length || 0} />
              <Stat label="Following" value={profile.following?.length || 0} />
              <Stat label="Posts" value={posts.length} />
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center gap-2 text-sm font-bold"><UserPlus className="h-4 w-4 text-primary" /> Posts</div>
        {posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id) => setPosts((current) => current.filter((item) => item._id !== id))} />)}
        {!posts.length && <Card><CardContent className="text-center text-sm text-slate-500">No posts yet.</CardContent></Card>}
      </div>
      <EditProfileModal open={editing} onClose={() => setEditing(false)} profile={profile} onSaved={setProfile} />
    </AppShell>
  );
}

function Stat({ label, value }) {
  return <div><p className="text-lg font-extrabold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>;
}
