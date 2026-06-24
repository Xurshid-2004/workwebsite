import type { Report, ReportStatus } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ReportRow } from '@/lib/supabase/database.types';

export type ReportTargetType = 'job' | 'user' | 'message';

export interface CreateReportInput {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type as Report['targetType'],
    targetId: row.target_id,
    reason: row.reason,
    details: row.details ?? undefined,
    status: row.status as ReportStatus,
    createdAt: row.created_at,
  };
}

export const supabaseReportsRepository = {
  async create(input: CreateReportInput): Promise<Report> {
    const { data, error } = await getSupabaseClient()
      .from('reports')
      .insert({
        reporter_id: input.reporterId,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason,
        details: input.details ?? null,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return mapReportRow(data as ReportRow);
  },

  async list(): Promise<Report[]> {
    const { data, error } = await getSupabaseClient()
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as ReportRow[]).map(mapReportRow);
  },

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    const { data, error } = await getSupabaseClient()
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapReportRow(data as ReportRow);
  },

  async countPending(): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (error) throw error;
    return count ?? 0;
  },
};
