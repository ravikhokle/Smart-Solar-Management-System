import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import api, { toast } from '../../services/api.js';
import Field from '../../components/common/Field.jsx';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const onSubmit = async (values) => {
    await api.post('/auth/forgot-password', values);
    toast('success', 'If an account exists, a reset email has been sent');
  };
  return (
    <AuthLayout title="Forgot password" subtitle="We will email a reset link if the account exists.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email">
          <input className="input" type="email" required {...register('email')} />
        </Field>
        <button className="btn-primary w-full" type="submit">
          Send reset link
        </button>
        <Link to="/login" className="block text-center text-sm text-solar-orange">
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
