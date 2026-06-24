'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { favoritesService } from '@/services/favorites.service';
import { jobsService } from '@/services/jobs.service';
import type { JobListItem } from '@/types';
import { isBackendEnabled } from '@/lib/backend/config';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (jobId: string) => boolean;
  toggleFavorite: (jobId: string) => Promise<boolean>;
  savedJobs: JobListItem[];
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<JobListItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const ids = isBackendEnabled()
          ? await favoritesService.getFavoriteJobIdsAsync()
          : favoritesService.getFavoriteJobIds();
        const jobs = await jobsService.listJobs(ids);
        const saved = jobs.filter((job) => ids.has(job.id));
        if (!cancelled) {
          setFavoriteIds(ids);
          setSavedJobs(saved);
          setIsHydrated(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load favorites');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [version]);

  const isFavorite = useCallback(
    (jobId: string) => favoriteIds.has(jobId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (jobId: string) => {
      const isNowSaved = isBackendEnabled()
        ? await favoritesService.toggleFavoriteAsync(jobId)
        : favoritesService.toggleFavorite(jobId);
      refresh();
      return isNowSaved;
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      savedJobs,
      isHydrated,
      isLoading,
      error,
      refresh,
    }),
    [favoriteIds, isFavorite, toggleFavorite, savedJobs, isHydrated, isLoading, error, refresh]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
