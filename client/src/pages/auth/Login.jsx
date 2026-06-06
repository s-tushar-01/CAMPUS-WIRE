import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { FieldError, Input } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const { register, getValues, setValue, trigger, formState: { errors, isSubmitting } } = useForm();

  const submit = async (values) => {
    try {
      const { data } = await api.post('/api/auth/login', values);
      login(data.token, data.user);
      navigate('/');
    } catch (error) {
      toast.error(unwrapApi(error));
    }
  };

  const syncAndSubmit = async (event) => {
    event.preventDefault();
    const formValues = Object.fromEntries(new FormData(event.currentTarget));
    Object.entries(formValues).forEach(([name, value]) => {
      setValue(name, value, { shouldDirty: true, shouldTouch: true });
    });

    if (await trigger()) {
      await submit(getValues());
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your private campus community." footer={<span>New here? <Link className="font-semibold text-primary" to="/register">Create an account</Link></span>}>
      <form className="space-y-4" onSubmit={syncAndSubmit}>
        <label className="block text-sm font-semibold">Email<Input className="mt-1" type="email" {...register('email', { required: 'Email is required' })} /></label>
        <FieldError>{errors.email?.message}</FieldError>
        <label className="block text-sm font-semibold">Password
          <div className="relative mt-1">
            <Input type={show ? 'text' : 'password'} {...register('password', { required: 'Password is required' })} />
            <button type="button" className="absolute right-3 top-3 text-slate-400" onClick={() => setShow((v) => !v)}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
        </label>
        <FieldError>{errors.password?.message}</FieldError>
        <div className="text-right"><Link className="text-sm font-semibold text-primary" to="/forgot-password">Forgot password?</Link></div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Button>
        <Button className="w-full" variant="outline" onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`; }}>Continue with Google</Button>
      </form>
    </AuthShell>
  );
}
