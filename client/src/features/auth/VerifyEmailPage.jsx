import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import api from '../../services/api.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying…');
  useEffect(() => {
    api
      .get('/auth/verify-email', { params: { token: params.get('token') }, skipToast: true })
      .then(() => setMessage('Email verified. You can sign in.'))
      .catch(() => setMessage('This verification link is invalid.'));
  }, [params]);
  return (
    <AuthLayout title="Email verification">
      <p className="text-sm text-solar-muted">{message}</p>
      <Link to="/login" className="btn-primary mt-4 inline-flex">Sign in</Link>
    </AuthLayout>
  );
}
