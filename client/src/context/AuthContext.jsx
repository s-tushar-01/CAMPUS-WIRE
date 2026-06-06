import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/me');
        if (!active) return;
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    hydrate();
    return () => {
      active = false;
    };
  }, [token]);

  const login = (nextToken, nextUser) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (nextUser) => {
    const merged = { ...user, ...nextUser };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  const value = useMemo(() => ({ user, token, loading, login, logout, updateUser }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function useLogoutRedirect() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  return () => {
    logout();
    navigate('/login', { replace: true });
  };
}
