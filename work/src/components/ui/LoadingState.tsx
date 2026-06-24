import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-gray-200/80', className)}
      aria-hidden
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-xl" />
        <Skeleton className="h-7 w-16 rounded-xl" />
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export interface JobListSkeletonProps {
  count?: number;
}

export function JobListSkeleton({ count = 3 }: JobListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="min-w-[88px] h-[96px] rounded-2xl shrink-0" />
      ))}
    </div>
  );
}

export interface PageLoadingStateProps {
  showBanner?: boolean;
}

export function PageLoadingState({ showBanner = true }: PageLoadingStateProps) {
  return (
    <div className="page-container">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>

      <Skeleton className="h-14 w-full rounded-2xl mb-8" />
      {showBanner && <Skeleton className="h-32 w-full rounded-2xl mb-8" />}

      <Skeleton className="h-6 w-36 mb-4" />
      <JobListSkeleton count={2} />

      <Skeleton className="h-6 w-28 mt-8 mb-4" />
      <CategorySkeleton />

      <Skeleton className="h-6 w-32 mt-8 mb-4" />
      <JobListSkeleton count={2} />
    </div>
  );
}

// Alias for backward compatibility within the codebase
export { PageLoadingState as LoadingState };
