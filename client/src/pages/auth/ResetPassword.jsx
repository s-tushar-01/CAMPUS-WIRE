import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/reset-password', { resetToken: sessionStorage.getItem('resetToken'), password });
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetEmail');
      toast.success('Password updated');
      navigate('/login');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create a new password" subtitle="Use at least 6 characters.">
      <form className="space-y-4" onSubmit={submit}>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" required minLength={6} />
        <Input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" required minLength={6} />
        <Button className="w-full" type="submit" disabled={busy}>{busy ? 'Updating...' : 'Update password'}</Button>
      </form>
    </AuthShell>
  );
}
