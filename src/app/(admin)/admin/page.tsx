'use client';

import Link from 'next/link';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { adminService } from '@/services/admin.service';
import { StatCard } from '@/components/admin/StatCard';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { Skeleton } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAsyncQuery(
    () => adminService.getDashboardStats(),
    [],
    {
      totalJobs: 0,
      activeJobs: 0,
      totalUsers: 0,
      totalChats: 0,
      pendingPosts: 0,
      pendingReports: 0,
    }
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Platform overview and moderation queue</p>
      </div>

      <QueryErrorBanner message={error} onRetry={refetch} className="border-red-900/50 bg-red-950/40 text-red-200" />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-slate-900" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard label="Total jobs" value={data.totalJobs} />
            <StatCard label="Active jobs" value={data.activeJobs} />
            <StatCard label="Users" value={data.totalUsers} />
            <StatCard label="Chats" value={data.totalChats} />
            <StatCard label="Pending posts" value={data.pendingPosts} hint="Awaiting approval" />
            <StatCard label="Pending reports" value={data.pendingReports} hint="Needs review" />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex flex-wrap gap-3">
            <Link href="/admin/jobs">
              <Button size="sm">Review job posts</Button>
            </Link>
            <Link href="/admin/reports">
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-200">
                View reports
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
