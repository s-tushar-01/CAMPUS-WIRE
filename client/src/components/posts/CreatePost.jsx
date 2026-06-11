import { Eye, ImagePlus, Megaphone, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Select, Textarea } from '../ui/Form';
import { unwrapApi } from '../../lib/utils';

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [audience, setAudience] = useState('campus');
  const [broadcast, setBroadcast] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreview('');
      return undefined;
    }
    const nextPreview = URL.createObjectURL(image);
    setPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [image]);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !image) return;
    setSaving(true);
    const form = new FormData();
    form.append('content', content.trim());
    form.append('audience', audience);
    if (image) form.append('image', image);
    if (broadcast) form.append('isBroadcast', 'true');
    try {
      const { data } = await api.post('/api/posts', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onCreated?.(data.post);
      setContent('');
      setImage(null);
      setAudience('campus');
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
            <div className="min-w-0 flex-1 space-y-3">
              <Textarea value={content} onChange={(event) => setContent(event.target.value.slice(0, 2000))} placeholder="What's happening on campus?" />
              <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
                <label className="relative">
                  <Eye className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Select className="pl-9" value={audience} onChange={(event) => setAudience(event.target.value)}>
                    <option value="campus">Campus</option>
                    <option value="followers">Followers</option>
                    <option value="friends">Friends</option>
                    <option value="private">Only me</option>
                  </Select>
                </label>
                {user?.role === 'admin' && (
                  <label className="flex min-h-11 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
                    <input type="checkbox" checked={broadcast} onChange={(event) => setBroadcast(event.target.checked)} />
                    <Megaphone className="h-4 w-4" />
                    Campus announcement
                  </label>
                )}
              </div>
            </div>
          </div>
          {image && (
            <div className="relative overflow-hidden rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-800 sm:ml-[52px]">
              {preview && <img src={preview} alt="Selected post attachment preview" className="max-h-72 w-full rounded-md object-cover" />}
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="truncate text-slate-600 dark:text-slate-300">{image.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setImage(null)}>
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="focus-ring inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <ImagePlus className="h-4 w-4" />
                Image
                <input className="hidden" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0])} />
              </label>
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
