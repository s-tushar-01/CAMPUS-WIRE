import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import StatusBanner from '../../components/ui/StatusBanner';
import StepIndicator from '../../components/ui/StepIndicator';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function VerifyRegistration() {
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorTone, setErrorTone] = useState('');
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
      navigate('/onboarding');
    } catch (error) {
      const message = unwrapApi(error);
      setErrorTone(message.toLowerCase().includes('expired') ? 'warning' : 'error');
      toast.error(unwrapApi(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the code sent to ${email || 'your email'}.`}
      footer={<span>Code expired? <Link className="font-semibold text-primary" to="/resend-verification">Get a new code</Link></span>}
    >
      <form className="space-y-4" onSubmit={submit}>
        <StepIndicator steps={['Create account', 'Verify email', 'Profile setup']} current={1} />
        {!email && <StatusBanner tone="warning" title="Email missing">Start signup again so we know where to verify the account.</StatusBanner>}
        {errorTone && <StatusBanner tone={errorTone} title={errorTone === 'warning' ? 'Code expired' : 'Verification failed'}>Check the six digits and try again.</StatusBanner>}
        <Input inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="text-center text-2xl font-bold tracking-[0.45em]" required />
        <Button className="w-full" type="submit" disabled={busy || otp.length !== 6 || !email}>{busy ? 'Verifying...' : 'Verify account'}</Button>
        <Link className="block text-center text-sm font-semibold text-primary" to="/register">Use a different email</Link>
      </form>
    </AuthShell>
  );
}
