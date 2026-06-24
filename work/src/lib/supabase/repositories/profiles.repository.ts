import type { User, UserProfileUpdate } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { mapProfileRow, mapProfileToRow } from '@/lib/supabase/mappers';
import type { ProfileRow } from '@/lib/supabase/database.types';

export const supabaseProfilesRepository = {
  async getById(id: string): Promise<User | undefined> {
    const { data, error } = await getSupabaseClient().from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapProfileRow(data as ProfileRow) : undefined;
  },

  async upsert(user: User): Promise<User> {
    const row = mapProfileToRow(user);
    const { data, error } = await getSupabaseClient().from('profiles').upsert(row).select().single();
    if (error) throw error;
    return mapProfileRow(data as ProfileRow);
  },

  async update(id: string, patch: UserProfileUpdate): Promise<User> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Profile not found');

    const merged: User = {
      ...existing,
      ...patch,
      notifications: patch.notifications
        ? { ...existing.notifications, ...patch.notifications }
        : existing.notifications,
    };

    return this.upsert(merged);
  },

  async list(): Promise<User[]> {
    const { data, error } = await getSupabaseClient().from('profiles').select('*').order('name');
    if (error) throw error;
    return ((data ?? []) as ProfileRow[]).map(mapProfileRow);
  },

  async setBlocked(id: string, blocked: boolean): Promise<User> {
    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .update({ blocked })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapProfileRow(data as ProfileRow);
  },

  async count(): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  },
};
