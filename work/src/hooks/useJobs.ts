'use client';

import { useFavorites } from '@/context/FavoritesContext';
import type { JobFilters, JobListItem, JobSearchParams } from '@/types';
import { jobsService } from '@/services';
import { useAsyncQuery } from './useAsyncQuery';

export function useJobs(filters: JobFilters | JobSearchParams = {}) {
  const { favoriteIds } = useFavorites();

  return useAsyncQuery(
    () => jobsService.searchJobs(favoriteIds, filters),
    [favoriteIds, filters],
    [] as JobListItem[]
  );
}

export function useJobCount(filters: JobFilters = {}) {
  return useAsyncQuery(() => jobsService.countJobs(filters), [filters], 0);
}

export function useFeaturedJobs(limit = 2) {
  const { favoriteIds } = useFavorites();

  return useAsyncQuery(
    () => jobsService.getFeaturedJobs(favoriteIds, limit),
    [favoriteIds, limit],
    [] as JobListItem[]
  );
}

export function useRecentJobs(limit = 4) {
  const { favoriteIds } = useFavorites();

  return useAsyncQuery(
    () => jobsService.getRecentJobs(favoriteIds, limit),
    [favoriteIds, limit],
    [] as JobListItem[]
  );
}
