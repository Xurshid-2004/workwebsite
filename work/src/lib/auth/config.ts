import type { AuthProviderId } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Auth provider configuration.
 * Set NEXT_PUBLIC_AUTH_PROVIDER=supabase with Supabase URL + anon key for real auth.
 */
export const AUTH_PROVIDER: AuthProviderId =
  (process.env.NEXT_PUBLIC_AUTH_PROVIDER as AuthProviderId | undefined) ?? 'mock';

export function isMockAuthEnabled(): boolean {
  return getActiveAuthProvider() === 'mock';
}

export function getActiveAuthProvider(): AuthProviderId {
  if (AUTH_PROVIDER === 'supabase' && isSupabaseConfigured()) {
    return 'supabase';
  }
  return 'mock';
}
