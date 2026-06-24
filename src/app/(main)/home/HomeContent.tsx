'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, TrendingUp } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import { SearchBar } from '@/components/jobs/SearchBar';
import { CategoryCard } from '@/components/jobs/CategoryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PageHeader } from '@/components/ui/PageHeader';
import { JobListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { useFeaturedJobs, useRecentJobs } from '@/hooks/useJobs';
import { useCategories } from '@/hooks/useCategories';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function HomeContent() {
  const user = useCurrentUser();
  const featured = useFeaturedJobs(2);
  const recent = useRecentJobs(4);
  const categoriesResult = useCategories();

  const featuredJobs = featured.data;
  const recentJobs = recent.data;
  const categories = categoriesResult.data;
  const isLoading = featured.isLoading || recent.isLoading || categoriesResult.isLoading;
  const error = featured.error ?? recent.error ?? categoriesResult.error;

  return (
    <div className="page-container">
      <PageHeader
        greeting={`Hello, ${user.name.split(' ')[0]} 👋`}
        title="Find your dream job"
        action={
          <button
            type="button"
            className="w-11 h-11 rounded-xl card flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-accent)] rounded-full ring-2 ring-white" />
          </button>
        }
      />

      <div className="mb-8">
        <SearchBar asLink placeholder="Search jobs, companies, skills..." />
      </div>

      <QueryErrorBanner message={error} onRetry={() => { featured.refetch(); recent.refetch(); categoriesResult.refetch(); }} />

      {isLoading ? (
        <JobListSkeleton count={3} />
      ) : (
        <>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 rounded-full px-2.5 py-1 mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Trending now
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-1">1,200+ new jobs this week</h2>
          <p className="text-blue-100 text-sm mb-4 max-w-xs">
            Explore top opportunities in design, tech, and more.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center text-sm font-semibold bg-white text-[var(--color-primary)] px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Browse jobs
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <SectionHeader title="Featured Jobs" href="/search" />
        <div className="flex flex-col gap-3 sm:gap-4">
          {featuredJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} featured />
          ))}
        </div>
      </section>

      <section className="mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <SectionHeader title="Categories" href="/categories" linkLabel="View all" />
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto hide-scrollbar pb-1">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Recent Jobs" />
        <div className="flex flex-col gap-3 sm:gap-4">
          {recentJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index + featuredJobs.length} />
          ))}
        </div>
      </section>
        </>
      )}
    </div>
  );
}
