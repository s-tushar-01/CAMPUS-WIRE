import { Camera, GraduationCap, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Form';
import StepIndicator from '../components/ui/StepIndicator';
import StatusBanner from '../components/ui/StatusBanner';
import { useAuth } from '../context/AuthContext';
import { unwrapApi } from '../lib/utils';

const interestOptions = ['Academics', 'Placements', 'Events', 'Clubs', 'Research', 'Sports', 'Startups', 'AI'];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    const form = new FormData();
    form.append('name', user?.name || '');
    if (user?.username) form.append('username', user.username);
    form.append('bio', [bio, department && `Department: ${department}`, batch && `Batch: ${batch}`, interests.length && `Interests: ${interests.join(', ')}`].filter(Boolean).join('\n'));
    if (profilePic) form.append('profilePic', profilePic);
    try {
      const { data } = await api.put('/api/users/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      sessionStorage.setItem('welcomeBack', 'Profile setup complete');
      toast.success('Profile setup complete');
      navigate('/');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-primary dark:bg-indigo-950"><Sparkles className="h-5 w-5" /></div>
              <div>
                <h1 className="text-2xl font-extrabold">Set up your CampusWire profile</h1>
                <p className="mt-1 text-sm text-slate-500">A few details help classmates recognize you and make better suggestions.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <StepIndicator steps={['Profile', 'Campus details', 'Interests']} current={step} />
            {step === 0 && (
              <div className="space-y-4">
                <StatusBanner title="Welcome, verified member">Your email is verified. Add a profile photo and short bio before entering the feed.</StatusBanner>
                <div className="flex items-center gap-4">
                  <Avatar user={user} size="lg" />
                  <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Camera className="h-4 w-4" />
                    Profile photo
                    <input className="hidden" type="file" accept="image/*" onChange={(event) => setProfilePic(event.target.files?.[0])} />
                  </label>
                  {profilePic && <span className="truncate text-sm text-slate-500">{profilePic.name}</span>}
                </div>
                <Textarea value={bio} onChange={(event) => setBio(event.target.value.slice(0, 160))} placeholder="Short bio" />
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <StatusBanner tone="info" title="Campus context">These fields are stored in your bio for now, so the current backend can support them.</StatusBanner>
                <label className="block text-sm font-semibold">Department<Input className="mt-1" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Computer Science" /></label>
                <label className="block text-sm font-semibold">Class or batch<Input className="mt-1" value={batch} onChange={(event) => setBatch(event.target.value)} placeholder="Batch 2027" /></label>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <StatusBanner tone="success" title="Pick your signals">Interest chips prepare future suggestions and make your profile easier to scan.</StatusBanner>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((item) => {
                    const active = interests.includes(item);
                    return <button key={item} className={`rounded-full px-3 py-2 text-sm font-bold ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`} onClick={() => setInterests((current) => active ? current.filter((value) => value !== item) : [...current, item])}>{item}</button>;
                  })}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-card bg-slate-50 p-3 dark:bg-slate-900"><GraduationCap className="h-5 w-5 text-primary" /><p className="mt-2 text-sm font-bold">Class discovery</p><p className="text-xs text-slate-500">Backend-ready placeholder.</p></div>
                  <div className="rounded-card bg-slate-50 p-3 dark:bg-slate-900"><Users className="h-5 w-5 text-primary" /><p className="mt-2 text-sm font-bold">Suggested follows</p><p className="text-xs text-slate-500">Available from Explore after setup.</p></div>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="secondary" disabled={step === 0 || saving} onClick={() => setStep((value) => value - 1)}>Back</Button>
              {step < 2 ? <Button onClick={() => setStep((value) => value + 1)}>Continue</Button> : <Button onClick={finish} disabled={saving}>{saving ? 'Saving...' : 'Finish setup'}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
