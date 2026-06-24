import { getSupabaseClient } from '@/lib/supabase/client';
import type { FavoriteRow } from '@/lib/supabase/database.types';

export const supabaseFavoritesRepository = {
  async getFavoriteIds(userId: string): Promise<Set<string>> {
    const { data, error } = await getSupabaseClient()
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return new Set(((data ?? []) as FavoriteRow[]).map((r) => r.job_id));
  },

  async toggle(userId: string, jobId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data, error: lookupError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const existing = data as FavoriteRow | null;
    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('job_id', jobId);
      if (error) throw error;
      return false;
    }

    const { error } = await supabase.from('favorites').insert({ user_id: userId, job_id: jobId });
    if (error) throw error;
    return true;
  },
};
