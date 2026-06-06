import { Megaphone, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';

export default function Broadcast() {
  const [content, setContent] = useState('');
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/api/posts/feed?limit=50').then(({ data }) => setHistory((data.posts || []).filter((post) => post.isBroadcast)));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post('/api/admin/broadcast', { content });
      setHistory((current) => [data.post, ...current]);
      setContent('');
      toast.success('Broadcast sent');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><h1 className="flex items-center gap-2 text-xl font-extrabold"><Megaphone className="h-5 w-5 text-primary" /> Broadcast Center</h1></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Textarea value={content} onChange={(event) => setContent(event.target.value.slice(0, 2000))} placeholder="Write your campus announcement..." required />
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{content.length}/2000</span><Button type="submit" disabled={sending || !content.trim()}><Send className="h-4 w-4" /> Send Broadcast</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h2 className="font-bold">Announcement history</h2></CardHeader>
        <CardContent className="space-y-3">
          {history.map((post) => <div key={post._id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><Badge variant="warning">Announcement</Badge><p className="mt-2 text-sm">{post.content}</p></div>)}
          {!history.length && <p className="text-sm text-slate-500">No broadcasts yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
