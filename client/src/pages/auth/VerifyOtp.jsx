import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import StatusBanner from '../../components/ui/StatusBanner';
import StepIndicator from '../../components/ui/StepIndicator';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem('resetEmail') || '';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', { email, otp });
      sessionStorage.setItem('resetToken', data.resetToken);
      toast.success('OTP verified');
      navigate('/reset-password');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Verify OTP" subtitle={`Enter the code sent to ${email || 'your email'}.`}>
      <form className="space-y-4" onSubmit={submit}>
        <StepIndicator steps={['Email', 'Verify OTP', 'New password']} current={1} />
        {!email && <StatusBanner tone="warning" title="Email missing">Start password reset again so we know which account to verify.</StatusBanner>}
        <Input inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="text-center text-2xl font-bold tracking-[0.45em]" required />
        <Button className="w-full" type="submit" disabled={busy || otp.length !== 6}>{busy ? 'Verifying...' : 'Verify code'}</Button>
      </form>
    </AuthShell>
  );
}
