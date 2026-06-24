import type { AuthRepository } from '@/lib/auth/repository';
import type { AuthSession, LoginCredentials, RegisterCredentials } from '@/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { supabaseProfilesRepository } from '@/lib/supabase/repositories/profiles.repository';

export const supabaseAuthRepository: AuthRepository = {
  async signInWithEmail({ email, password }: LoginCredentials): Promise<AuthSession> {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed');

    const profile = await supabaseProfilesRepository.getById(data.user.id);
    if (profile?.blocked) {
      await getSupabaseClient().auth.signOut();
      throw new Error('This account has been blocked. Contact support.');
    }

    return {
      userId: data.user.id,
      email: data.user.email ?? email,
      provider: 'supabase',
      isMock: false,
      createdAt: new Date().toISOString(),
    };
  },

  async signUpWithEmail({
    name,
    email,
    password,
    profileRole,
  }: RegisterCredentials): Promise<AuthSession> {
    const { data, error } = await getSupabaseClient().auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');

    const userId = data.user.id;
    await supabaseProfilesRepository.upsert({
      id: userId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      role: profileRole === 'poster' ? 'poster' : 'seeker',
      profileRole,
      language: 'en',
      notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      badge: 'Member',
    });

    return {
      userId,
      email: email.trim().toLowerCase(),
      provider: 'supabase',
      isMock: false,
      createdAt: new Date().toISOString(),
    };
  },

  async signOut(): Promise<void> {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  },

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    const session = data.session;
    if (!session?.user) return null;

    return {
      userId: session.user.id,
      email: session.user.email ?? '',
      provider: 'supabase',
      isMock: false,
      createdAt: session.user.created_at ?? new Date().toISOString(),
    };
  },

  async getAuthUser() {
    const session = await this.getSession();
    if (!session) return null;
    return { id: session.userId, email: session.email, emailVerified: true };
  },

  onAuthStateChanged(callback) {
    const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      callback({
        userId: session.user.id,
        email: session.user.email ?? '',
        provider: 'supabase',
        isMock: false,
        createdAt: session.user.created_at ?? new Date().toISOString(),
      });
    });
    return () => data.subscription.unsubscribe();
  },
};
