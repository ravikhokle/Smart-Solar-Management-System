import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import api, { setCredentials, toast } from '../../services/api.js';
import Field from '../../components/common/Field.jsx';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const onSubmit = async (values) => {
    const res = await api.post('/auth/login', values);
    dispatch(setCredentials(res.data.data));
    toast('success', 'Signed in');
    navigate('/');
  };

  return (
    <AuthLayout title="Sign in" subtitle="Use the administrator account created with npm run create-admin.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email">
          <input className="input" type="email" required {...register('email')} />
        </Field>
        <Field label="Password">
          <input className="input" type="password" required {...register('password')} />
        </Field>
        <button className="btn-primary w-full" type="submit">
          Sign in
        </button>
        <Link to="/forgot-password" className="block text-center text-sm text-solar-orange">
          Forgot password
        </Link>
      </form>
    </AuthLayout>
  );
}
