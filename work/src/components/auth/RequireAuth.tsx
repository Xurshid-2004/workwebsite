'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (user.blocked) {
      router.replace('/login?blocked=1');
    }
  }, [isAuthenticated, isHydrated, user.blocked, redirectTo, router]);

  if (!isHydrated) {
    return (
      <div className="page-container min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || user.blocked) {
    return (
      <div className="page-container min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">Redirecting to sign in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
