import { useEffect, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../ui/Button';
import { unwrapApi } from '../../lib/utils';

export default function FollowButton({ userId, initialFollowing = false, onChange, size = 'sm' }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing, userId]);

  const toggle = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/api/users/${userId}/follow`);
      setFollowing(data.following);
      onChange?.(data);
      toast.success(data.following ? 'Now following' : 'Unfollowed');
    } catch (error) {
      toast.error(unwrapApi(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size={size} variant={following ? 'secondary' : 'primary'} onClick={toggle} disabled={busy}>
      {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}
