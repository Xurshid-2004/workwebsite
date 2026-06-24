import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getActiveAuthProvider } from '@/lib/auth/config';
import { mockAuthRepository } from './mock-auth.adapter';
import { supabaseAuthRepository } from './supabase-auth.adapter';
import type { AuthRepository } from '@/lib/auth/repository';

export function getAuthRepository(): AuthRepository {
  const provider = getActiveAuthProvider();

  if (provider === 'supabase' && isSupabaseConfigured()) {
    return supabaseAuthRepository;
  }

  return mockAuthRepository;
}
