import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, SunMedium } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { loginUser, registerUser, clearError } from '../features/auth/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: 'admin@heliosflow.com',
    password: 'password123',
    role: 'admin',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      const res = await dispatch(registerUser(formData));
      if (!res.error) navigate('/');
    } else {
      const res = await dispatch(
        loginUser({ email: formData.email, password: formData.password })
      );
      if (!res.error) navigate('/');
    }
  };

  const handleDemoLogin = (email, password) => {
    dispatch(loginUser({ email, password })).then((res) => {
      if (!res.error) navigate('/');
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-solar-primary">
          {isRegister ? 'Create Solar EPC Account' : 'Welcome to HeliosFlow'}
        </h2>
        <p className="text-xs text-solar-text-muted mt-1">
          {isRegister
            ? 'Sign up to manage photovoltaic microgrids and site surveys'
            : 'Enter your corporate credentials to access the solar operations center'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-solar-danger font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {isRegister && (
          <Input
            label="Full Name"
            name="name"
            icon={User}
            placeholder="Elena Rostova"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}

        <Input
          label="Corporate Email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="admin@heliosflow.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          variant="secondary"
          size="md"
          className="w-full mt-2"
          isLoading={loading}
        >
          {isRegister ? 'Register Account' : 'Sign In to Dashboard'}
        </Button>
      </form>

      {/* Demo Credentials Section for fast testing */}
      <div className="pt-4 border-t border-solar-border space-y-2.5">
        <p className="text-[11px] font-semibold text-solar-text-muted uppercase tracking-wider text-center">
          Quick Demo Access (One-Click)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@heliosflow.com', 'password123')}
            className="p-2 rounded-lg border border-solar-border bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-solar-primary font-medium transition-all text-center"
          >
            Solar Admin
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('marcus@heliosflow.com', 'password123')}
            className="p-2 rounded-lg border border-solar-border bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-solar-primary font-medium transition-all text-center"
          >
            Project Manager
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            if (error) dispatch(clearError());
          }}
          className="text-xs text-solar-secondary font-semibold hover:underline"
        >
          {isRegister
            ? 'Already have an account? Sign In'
            : "Don't have an account? Register now"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
