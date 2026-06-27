'use client';

import React from 'react';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useMyJobPosts } from '@/hooks/useMyJobs';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { Briefcase } from 'lucide-react';
import { JOB_STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export default function MyJobsPage() {
  useScrollRestore();
  const { jobs, isLoading, error, refetch } = useMyJobPosts();

  return (
    <RequireAuth>
    <div className="page-container">
      <PageHeader
        title="Mening eʼlonlarim"
        onRefresh={refetch}
        subtitle={
          jobs.length > 0
            ? `${jobs.length} ta eʼlon joylangan.`
            : 'Siz joylagan ishlar shu yerda koʻrinadi.'
        }
      />

      <QueryErrorBanner message={error} onRetry={refetch} className="mb-4" />

      {isLoading ? (
        <JobListSkeleton count={3} />
      ) : jobs.length > 0 ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          {jobs.map((job, index) => (
            <div key={job.id} className="relative">
              <span
                className={cn(
                  'absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md',
                  job.status === 'active' && 'bg-[var(--color-success-light)] text-[var(--color-success)]',
                  job.status === 'pending' && 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
                  job.status === 'draft' && 'bg-gray-100 text-[var(--color-muted)]',
                  job.status === 'closed' && 'bg-red-50 text-red-500'
                )}
              >
                {JOB_STATUS_LABELS[job.status]}
              </span>
              <JobCard job={job} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="Hali eʼlon yoʻq"
          description="Birinchi eʼloningizni joylang va arizalar qabul qilishni boshlang."
          action={
            <Link href="/create">
              <Button variant="accent">Ish joylash</Button>
            </Link>
          }
        />
      )}
    </div>
    </RequireAuth>
  );
}
