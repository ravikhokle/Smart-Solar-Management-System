import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import api, { toast } from '../../services/api.js';
import Field from '../../components/common/Field.jsx';

export default function ResetPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    await api.post('/auth/reset-password', { token: params.get('token'), password: values.password });
    toast('success', 'Password updated');
    navigate('/login');
  };
  return (
    <AuthLayout title="Reset password">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="New password">
          <input className="input" type="password" minLength={8} required {...register('password')} />
        </Field>
        <button className="btn-primary w-full" type="submit">
          Update password
        </button>
        <Link to="/login" className="block text-center text-sm text-solar-orange">
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
