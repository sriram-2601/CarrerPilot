import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { Button } from '../components/Button.jsx';
import { Field } from '../components/Field.jsx';
import { ErrorBanner } from '../components/ErrorBanner.jsx';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      setAuth({
        user: res.data.user,
        token: res.data.token,
        profile: res.data.profile
      });
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-paper">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-moss flex items-center justify-center text-white font-bold text-lg mx-auto shadow-soft">
            CP
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Create Student Account
          </h1>
          <p className="text-xs text-ink-500">
            Automate your internship search with cooperating AI agents
          </p>
        </div>

        <ErrorBanner message={serverError} onDismiss={() => setServerError('')} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Full Name" error={errors.name?.message} required id="name">
            <input
              id="name"
              type="text"
              placeholder="Alex Rivera"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
            />
          </Field>

          <Field label="Email Address" error={errors.email?.message} required id="email">
            <input
              id="email"
              type="email"
              placeholder="alex@university.edu"
              {...register('email', { required: 'Email address is required' })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
            />
          </Field>

          <Field label="Password" error={errors.password?.message} required id="password">
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
            />
          </Field>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Register & Start Pipeline
          </Button>
        </form>

        <p className="text-center text-xs text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-moss hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
