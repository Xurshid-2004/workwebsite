'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { adminService } from '@/services/admin.service';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { Skeleton } from '@/components/ui/LoadingState';
import { JOB_STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminJobsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const jobsQuery = useAsyncQuery(() => adminService.listAllJobs(), [], []);

  const filtered = jobsQuery.data.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const runAction = useCallback(
    async (action: () => Promise<void>, message: string) => {
      try {
        await action();
        toast.success(message);
        jobsQuery.refetch();
      } catch {
        toast.error('Action failed');
      }
    },
    [jobsQuery]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Job posts</h2>
        <p className="text-sm text-slate-400 mt-1">Approve, reject, or remove listings</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'active'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
              filter === value
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <QueryErrorBanner message={jobsQuery.error} onRetry={jobsQuery.refetch} />

      {jobsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-slate-900" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No jobs in this view.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white truncate">{job.title}</h3>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {JOB_STATUS_LABELS[job.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {job.companyName} · by {job.posterName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(job.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/job/${job.id}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="View job"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {job.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => runAction(() => adminService.approveJob(job.id), 'Job approved')}
                      className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
                      aria-label="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction(() => adminService.rejectJob(job.id), 'Job rejected')}
                      className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10"
                      aria-label="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    runAction(() => adminService.deleteJob(job.id), 'Job deleted')
                  }
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
