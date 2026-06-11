import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import StatusBanner from '../../components/ui/StatusBanner';
import AuthShell from './AuthShell';

export default function ResendVerification() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('signupEmail') || '';

  const resend = () => {
    toast.info('Resend OTP needs the backend resend endpoint. Please register again for a fresh code.');
    navigate('/register');
  };

  return (
    <AuthShell title="Need a new code?" subtitle={`We can help recover verification for ${email || 'your email'}.`}>
      <div className="space-y-4">
        <StatusBanner tone="warning" title="Resend is not connected yet">
          The UI is ready, but the backend resend-verification endpoint still needs to be added.
        </StatusBanner>
        <Button className="w-full" onClick={resend}>Start signup again</Button>
        <Link className="block text-center text-sm font-semibold text-primary" to="/verify-signup">Back to verification</Link>
      </div>
    </AuthShell>
  );
}
