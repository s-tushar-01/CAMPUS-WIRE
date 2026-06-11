import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function VerifyRegistration() {
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = sessionStorage.getItem('signupEmail') || '';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/api/auth/verify-registration', { email, otp });
      sessionStorage.removeItem('signupEmail');
      login(data.token, data.user);
      toast.success('Email verified');
      navigate('/');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the code sent to ${email || 'your email'}.`}
      footer={<span>Wrong email? <Link className="font-semibold text-primary" to="/register">Create account again</Link></span>}
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="text-center text-2xl font-bold tracking-[0.45em]" required />
        <Button className="w-full" type="submit" disabled={busy || otp.length !== 6 || !email}>{busy ? 'Verifying...' : 'Verify account'}</Button>
      </form>
    </AuthShell>
  );
}
