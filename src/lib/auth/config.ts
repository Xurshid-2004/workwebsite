import type { AuthProviderId } from '@/types';
import { isFirebaseConfigured } from '@/lib/firebase/client';

/**
 * Auth provider configuration.
 * Set NEXT_PUBLIC_AUTH_PROVIDER=firebase with Firebase env vars for real auth.
 */
export const AUTH_PROVIDER: AuthProviderId =
  (process.env.NEXT_PUBLIC_AUTH_PROVIDER as AuthProviderId | undefined) ?? 'mock';

export function isMockAuthEnabled(): boolean {
  return getActiveAuthProvider() === 'mock';
}

export function getActiveAuthProvider(): AuthProviderId {
  if (AUTH_PROVIDER === 'firebase' && isFirebaseConfigured()) {
    return 'firebase';
  }
  return 'mock';
}
