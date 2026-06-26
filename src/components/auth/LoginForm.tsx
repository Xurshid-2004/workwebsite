'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MockAuthNotice } from './MockAuthNotice';
import { useAuth } from '@/context/AuthContext';
import { validateLogin, hasAuthErrors, type AuthFormErrors } from '@/lib/validations/auth.validation';
import { formatUserError } from '@/lib/errors/format-user-error';

export function LoginForm() {
  const router = useRouter();
  const { login, isMockAuth } = useAuth();
  const [email, setEmail] = useState('demo@jobmarket.app');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateLogin({ email, password });
    setErrors(validation);
    if (hasAuthErrors(validation)) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      router.push('/home');
    } catch (err) {
      toast.error(formatUserError(err, 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isMockAuth && <MockAuthNotice />}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        hint={isMockAuth ? 'Any password works in mock mode' : undefined}
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Sign in
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        No account?{' '}
        <Link href="/register" className="text-[var(--color-primary)] font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
