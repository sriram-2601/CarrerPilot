import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { Button } from '../components/Button.jsx';
import { Field } from '../components/Field.jsx';
import { ErrorBanner } from '../components/ErrorBanner.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth({
        user: res.data.user,
        token: res.data.token,
        profile: res.data.profile
      });
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setValue('email', 'demo@careerpilot.ai');
    setValue('password', 'Password@123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-elevated space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-moss flex items-center justify-center text-white font-bold text-lg mx-auto shadow-soft">
            CP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Welcome to CareerPilot AI
          </h1>
          <p className="text-xs text-ink-500">
            The Agentic Internship Workflow Platform
          </p>
        </div>

        <ErrorBanner message={serverError} onDismiss={() => setServerError('')} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email Address" error={errors.email?.message} required id="email">
            <input
              id="email"
              type="email"
              placeholder="student@university.edu"
              {...register('email', { required: 'Email address is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
            />
          </Field>

          <Field label="Password" error={errors.password?.message} required id="password">
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
            />
          </Field>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In to Console
          </Button>
        </form>

        {/* Demo Account Quick-Fill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-center">
          <p className="text-[11px] font-semibold text-ink-600 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-moss" />
            Quick Evaluation Mode
          </p>
          <button
            type="button"
            onClick={autofillDemo}
            className="text-xs font-bold text-moss hover:underline"
          >
            Autofill Pre-seeded Demo Student
          </button>
          <p className="text-[10px] text-ink-400">demo@careerpilot.ai / Password@123</p>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-ink-500">
          New to CareerPilot?{' '}
          <Link to="/register" className="font-bold text-moss hover:underline">
            Create a student account
          </Link>
        </p>
      </div>
    </div>
  );
}
