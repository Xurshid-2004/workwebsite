'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { adminService } from '@/services/admin.service';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { Skeleton } from '@/components/ui/LoadingState';
import type { ReportStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: ReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed'];

export default function AdminReportsPage() {
  const reportsQuery = useAsyncQuery(() => adminService.listReports(), [], []);

  const updateStatus = useCallback(
    async (id: string, status: ReportStatus) => {
      try {
        await adminService.updateReportStatus(id, status);
        toast.success('Report updated');
        reportsQuery.refetch();
      } catch {
        toast.error('Could not update report');
      }
    },
    [reportsQuery]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <p className="text-sm text-slate-400 mt-1">Review flagged jobs, users, and messages</p>
      </div>

      <QueryErrorBanner message={reportsQuery.error} onRetry={reportsQuery.refetch} />

      {reportsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-slate-900" />
          ))}
        </div>
      ) : reportsQuery.data.length === 0 ? (
        <p className="text-sm text-slate-500">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {reportsQuery.data.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                  {report.targetType}
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md',
                    report.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  )}
                >
                  {report.status}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-white font-medium">{report.reason}</p>
              {report.details && <p className="text-sm text-slate-400">{report.details}</p>}
              <p className="text-xs text-slate-500">
                Target: {report.targetId} · Reporter: {report.reporterId}
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.filter((s) => s !== report.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(report.id, status)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 capitalize"
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
