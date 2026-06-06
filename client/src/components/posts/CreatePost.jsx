import { ImagePlus, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Textarea } from '../ui/Form';
import { unwrapApi } from '../../lib/utils';

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [broadcast, setBroadcast] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !image) return;
    setSaving(true);
    const form = new FormData();
    form.append('content', content.trim());
    if (image) form.append('image', image);
    if (broadcast) form.append('isBroadcast', 'true');
    try {
      const { data } = await api.post('/api/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onCreated?.(data.post);
      setContent('');
      setImage(null);
      setBroadcast(false);
      toast.success(broadcast ? 'Announcement posted' : 'Post published');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3">
            <Avatar user={user} />
            <Textarea value={content} onChange={(event) => setContent(event.target.value.slice(0, 2000))} placeholder="What's happening on campus?" />
          </div>
          {image && <div className="rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-800 sm:ml-[52px]">{image.name}</div>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="focus-ring inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <ImagePlus className="h-4 w-4" />
                Image
                <input className="hidden" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0])} />
              </label>
              {user?.role === 'admin' && (
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={broadcast} onChange={(event) => setBroadcast(event.target.checked)} />
                  Broadcast
                </label>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{content.length}/2000</span>
              <Button type="submit" disabled={saving || (!content.trim() && !image)}>
                <Send className="h-4 w-4" />
                {saving ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
