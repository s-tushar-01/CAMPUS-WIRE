import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      sessionStorage.setItem('resetEmail', email);
      toast.success('OTP sent');
      navigate('/verify-otp');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send a 6-digit OTP.">
      <form className="space-y-4" onSubmit={submit}>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@campus.edu" required />
        <Button className="w-full" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send OTP'}</Button>
      </form>
    </AuthShell>
  );
}
