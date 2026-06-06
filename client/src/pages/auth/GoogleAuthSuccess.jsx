import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function GoogleAuthSuccess() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      navigate('/login');
      return;
    }
    localStorage.setItem('token', token);
    api.get('/api/auth/me').then(({ data }) => {
      login(token, data.user);
      navigate('/');
    }).catch(() => navigate('/login'));
  }, [params, login, navigate]);

  return <div className="grid min-h-screen place-items-center bg-slate-50 font-semibold dark:bg-slate-950">Signing you in...</div>;
}
