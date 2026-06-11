import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import StatusBanner from '../../components/ui/StatusBanner';
import AuthShell from './AuthShell';

export default function AuthError() {
  const [params] = useSearchParams();
  const message = params.get('message') || 'Google sign in could not finish. Please try again.';

  return (
    <AuthShell title="Sign in needs attention" subtitle="Your account is safe. Choose another sign-in path or try again.">
      <div className="space-y-4">
        <StatusBanner tone="error" title="Authentication failed">{message}</StatusBanner>
        <Button className="w-full" onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`; }}>Try Google again</Button>
        <Link className="block text-center text-sm font-semibold text-primary" to="/login">Use email and password</Link>
      </div>
    </AuthShell>
  );
}
