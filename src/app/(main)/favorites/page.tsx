'use client';

import React from 'react';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { useFavorites } from '@/context/FavoritesContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Bookmark } from 'lucide-react';

export default function FavoritesPage() {
  const { savedJobs, isLoading, error, refresh, isHydrated } = useFavorites();

  return (
    <RequireAuth>
    <div className="page-container">
      <PageHeader
        title="Saved Jobs"
        subtitle={
          savedJobs.length > 0
            ? `You have ${savedJobs.length} job${savedJobs.length === 1 ? '' : 's'} saved for later.`
            : 'Jobs you bookmark will appear here.'
        }
      />

      <QueryErrorBanner message={error} onRetry={refresh} className="mb-4" />

      {!isHydrated || isLoading ? (
        <JobListSkeleton count={4} />
      ) : savedJobs.length > 0 ? (
        <div className="flex flex-col gap-3 sm:gap-4">
          {savedJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Tap the bookmark icon on any job to save it here for quick access."
          action={
            <Link href="/search">
              <Button>Browse jobs</Button>
            </Link>
          }
        />
      )}
    </div>
    </RequireAuth>
  );
}
