import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Textarea } from '../ui/Form';
import { unwrapApi } from '../../lib/utils';

export default function EditProfileModal({ open, onClose, profile, onSaved }) {
  const { updateUser } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name || '');
    setUsername(profile?.username || '');
    setBio(profile?.bio || '');
  }, [profile]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData();
    form.append('name', name);
    form.append('username', username);
    form.append('bio', bio);
    if (profilePic) form.append('profilePic', profilePic);
    if (coverPic) form.append('coverPic', coverPic);

    try {
      const { data } = await api.put('/api/users/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      onSaved?.(data.user);
      toast.success('Profile updated');
      onClose();
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Edit profile" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-semibold">
          Name
          <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
        </label>
        <label className="block text-sm font-semibold">
          Username
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-3 text-sm font-bold text-slate-400">@</span>
            <Input className="pl-7" value={username} onChange={(event) => setUsername(event.target.value.replace(/^@+/, '').slice(0, 30))} required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" />
          </div>
        </label>
        <label className="block text-sm font-semibold">
          Bio
          <Textarea className="mt-1" value={bio} onChange={(event) => setBio(event.target.value.slice(0, 160))} maxLength={160} />
          <span className="mt-1 block text-xs text-slate-500">{bio.length}/160</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Profile photo
            <Input className="mt-1" type="file" accept="image/*" onChange={(event) => setProfilePic(event.target.files?.[0])} />
          </label>
          <label className="block text-sm font-semibold">
            Cover photo
            <Input className="mt-1" type="file" accept="image/*" onChange={(event) => setCoverPic(event.target.files?.[0])} />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </form>
    </Modal>
  );
}
