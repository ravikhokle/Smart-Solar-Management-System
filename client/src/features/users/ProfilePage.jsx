import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import api, { toast } from '../../services/api.js';
import { setUser } from '../auth/authSlice.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Field from '../../components/common/Field.jsx';

export default function ProfilePage() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const profile = useForm();
  const pwd = useForm();
  useEffect(() => {
    profile.reset({ name: user?.name, phone: user?.phone });
  }, [user]);

  return (
    <div>
      <PageHeader title="Profile" subtitle={user?.email} />
      <div className="grid gap-4 lg:grid-cols-2">
        <form className="card grid gap-3 p-5" onSubmit={profile.handleSubmit(async (v) => {
          const res = await api.patch('/auth/profile', v);
          dispatch(setUser(res.data.data));
          toast('success', 'Profile updated');
        })}>
          <Field label="Name"><input className="input" {...profile.register('name')} /></Field>
          <Field label="Phone"><input className="input" {...profile.register('phone')} /></Field>
          <button className="btn-primary w-fit" type="submit">Save profile</button>
        </form>
        <form className="card grid gap-3 p-5" onSubmit={pwd.handleSubmit(async (v) => {
          await api.post('/auth/change-password', v);
          toast('success', 'Password changed');
          pwd.reset();
        })}>
          <Field label="Current password"><input className="input" type="password" {...pwd.register('currentPassword')} /></Field>
          <Field label="New password"><input className="input" type="password" minLength={8} {...pwd.register('newPassword')} /></Field>
          <button className="btn-primary w-fit" type="submit">Change password</button>
        </form>
      </div>
    </div>
  );
}
