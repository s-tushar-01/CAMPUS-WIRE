import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GoogleAuthSuccess() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function completeGoogleLogin() {
    const token = params.get('token');
    if (!token) {
        setError('Google did not return a login token. Please try signing in again.');
      return;
    }

    localStorage.setItem('token', token);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || `Auth check failed with status ${response.status}`);
        }

        if (!active) return;
        login(token, data.user);
        navigate('/', { replace: true });
      } catch (err) {
        if (!active) return;
        setError(`${err.message || 'Could not complete Google sign in.'} API: ${apiUrl}`);
      }
    }

    completeGoogleLogin();
    return () => {
      active = false;
    };
  }, [params, login, navigate]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="surface w-full max-w-md rounded-panel p-6 text-center">
          <h1 className="text-xl font-extrabold">Google sign in could not finish</h1>
          <p className="mt-3 text-sm text-error">{error}</p>
          <button className="mt-5 text-sm font-semibold text-primary" onClick={() => navigate('/login', { replace: true })}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return <div className="grid min-h-screen place-items-center bg-slate-50 font-semibold dark:bg-slate-950">Signing you in...</div>;
}
