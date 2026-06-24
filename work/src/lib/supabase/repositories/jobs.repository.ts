import type { Job } from '@/types';
import type { JobStatus } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { mapJobRow, mapJobToRow } from '@/lib/supabase/mappers';
import type { JobRow } from '@/lib/supabase/database.types';

export const supabaseJobsRepository = {
  async getAll(): Promise<Job[]> {
    const { data, error } = await getSupabaseClient().from('jobs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as JobRow[]).map(mapJobRow);
  },

  async getActive(): Promise<Job[]> {
    const { data, error } = await getSupabaseClient()
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as JobRow[]).map(mapJobRow);
  },

  async getById(id: string): Promise<Job | undefined> {
    const { data, error } = await getSupabaseClient().from('jobs').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapJobRow(data as JobRow) : undefined;
  },

  async insert(job: Job): Promise<Job> {
    const row = mapJobToRow(job);
    const { data, error } = await getSupabaseClient().from('jobs').insert(row).select().single();
    if (error) throw error;
    return mapJobRow(data as JobRow);
  },

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    const { data, error } = await getSupabaseClient()
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapJobRow(data as JobRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from('jobs').delete().eq('id', id);
    if (error) throw error;
  },

  async countByStatus(status?: JobStatus): Promise<number> {
    let query = getSupabaseClient().from('jobs').select('id', { count: 'exact', head: true });
    if (status) query = query.eq('status', status);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },
};
