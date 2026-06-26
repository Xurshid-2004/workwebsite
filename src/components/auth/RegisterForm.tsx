'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ProfileRole } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MockAuthNotice } from './MockAuthNotice';
import { useAuth } from '@/context/AuthContext';
import {
  validateRegister,
  hasAuthErrors,
  PROFILE_ROLE_OPTIONS,
  type AuthFormErrors,
} from '@/lib/validations/auth.validation';
import { formatUserError } from '@/lib/errors/format-user-error';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const { register, isMockAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileRole, setProfileRole] = useState<ProfileRole>('seeker');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateRegister({
      name,
      email,
      password,
      confirmPassword,
      profileRole,
    });
    setErrors(validation);
    if (hasAuthErrors(validation)) return;

    setIsSubmitting(true);
    try {
      await register({ name, email, password, profileRole });
      toast.success('Account created!');
      router.push('/home');
    } catch (err) {
      toast.error(formatUserError(err, 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isMockAuth && <MockAuthNotice />}

      <Input
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Alex Johnson"
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <div>
        <p className="text-sm font-medium text-[var(--color-secondary)] mb-2">I want to</p>
        <div className="grid grid-cols-1 gap-2">
          {PROFILE_ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setProfileRole(opt.value)}
              className={cn(
                'text-left rounded-xl border p-3 transition-colors',
                profileRole === opt.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/50'
                  : 'border-[var(--color-border)] hover:bg-gray-50'
              )}
            >
              <span className="text-sm font-semibold text-[var(--color-secondary)] block">
                {opt.label}
              </span>
              <span className="text-xs text-[var(--color-muted)]">{opt.description}</span>
            </button>
          ))}
        </div>
        {errors.profileRole && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {errors.profileRole}
          </p>
        )}
      </div>

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="new-password"
        hint="At least 6 characters (not stored in mock mode)"
      />

      <Input
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
