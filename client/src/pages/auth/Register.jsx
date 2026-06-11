import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { FieldError, Input, Select } from '../../components/ui/Form';
import { unwrapApi } from '../../lib/utils';
import AuthShell from './AuthShell';

export default function Register() {
  const navigate = useNavigate();
  const { register, getValues, setValue, trigger, formState: { errors, isSubmitting } } = useForm();

  const submit = async ({ roleLabel, ...values }) => {
    try {
      const { data } = await api.post('/api/auth/register', values);
      sessionStorage.setItem('signupEmail', data.email || values.email);
      toast.success(data.message || 'Check your email for the verification code');
      navigate('/verify-signup');
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
    <AuthShell title="Join CampusWire" subtitle="Create your profile for a closed educational network." footer={<span>Already have an account? <Link className="font-semibold text-primary" to="/login">Sign in</Link></span>}>
      <form className="space-y-4" onSubmit={syncAndSubmit}>
        <label className="block text-sm font-semibold">Name<Input className="mt-1" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Use at least 2 characters' } })} /></label>
        <FieldError>{errors.name?.message}</FieldError>
        <label className="block text-sm font-semibold">Username<Input className="mt-1" placeholder="campus_user" {...register('username', { minLength: { value: 3, message: 'Use at least 3 characters' }, maxLength: { value: 30, message: 'Use 30 characters or less' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores' } })} /></label>
        <FieldError>{errors.username?.message}</FieldError>
        <label className="block text-sm font-semibold">Email<Input className="mt-1" type="email" {...register('email', { required: 'Email is required' })} /></label>
        <FieldError>{errors.email?.message}</FieldError>
        <label className="block text-sm font-semibold">Password<Input className="mt-1" type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })} /></label>
        <FieldError>{errors.password?.message}</FieldError>
        <label className="block text-sm font-semibold">I am a<Select className="mt-1" {...register('roleLabel')}><option>Student</option><option>Faculty</option><option>Other</option></Select></label>
        <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create account'}</Button>
        <Button className="w-full" variant="outline" onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`; }}>Continue with Google</Button>
      </form>
    </AuthShell>
  );
}
