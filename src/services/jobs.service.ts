import type { Job, JobFilters, JobListItem, JobSearchParams, JobStatus } from '@/types';
import type { CreateJobFormData } from '@/types';
import { jobs as jobsData, categories as categoriesData } from '@/data';
import { toJobListItem, toJobListItems } from '@/lib/mappers/job.mapper';
import { createJobFormToEntity } from '@/lib/mappers/create-job.mapper';
import { resolveFilterId } from '@/lib/filters/job-filters';
import { userJobsStore } from '@/services/user-jobs.store';
import { jobModerationStore } from '@/services/job-moderation.store';
import { isBackendEnabled } from '@/lib/backend/config';
import { firebaseJobsRepository } from '@/lib/firebase/repositories/jobs.repository';
import {
  matchesSearchParams,
  sortJobs,
  DEFAULT_SEARCH_PARAMS,
} from '@/lib/filters/job-search';

async function fetchAllJobs(): Promise<Job[]> {
  if (isBackendEnabled()) {
    return firebaseJobsRepository.getAll();
  }
  const userJobs = typeof window !== 'undefined' ? userJobsStore.getAll() : [];
  const merged = [...userJobs, ...jobsData]
    .map((job) => jobModerationStore.applyToJob(job))
    .filter((job): job is Job => job !== null);
  return merged;
}

async function fetchActiveJobs(): Promise<Job[]> {
  const all = await fetchAllJobs();
  return all.filter((job) => job.status === 'active');
}

function applyLegacyFilters(job: Job, filters: JobFilters): boolean {
  if (filters.posterId && job.posterId !== filters.posterId) return false;
  if (filters.status && job.status !== filters.status) return false;
  if (filters.categoryId && job.categoryId !== filters.categoryId) return false;

  if (filters.categorySlug) {
    const cat = categoriesData.find((c) => c.slug === filters.categorySlug);
    if (cat && job.categoryId !== cat.id) return false;
  }

  if (filters.filterId && filters.filterId !== 'all') {
    const resolved = resolveFilterId(filters.filterId);
    if (resolved.workType && job.workType !== resolved.workType) return false;
    if (resolved.scheduleType && job.scheduleType !== resolved.scheduleType) return false;
  }

  if (filters.workType && filters.workType !== 'all' && job.workType !== filters.workType) {
    return false;
  }

  if (
    filters.scheduleType &&
    filters.scheduleType !== 'all' &&
    job.scheduleType !== filters.scheduleType
  ) {
    return false;
  }

  if (filters.query?.trim()) {
    const q = filters.query.toLowerCase().trim();
    if (!job.title.toLowerCase().includes(q)) return false;
  }

  return true;
}

function resolveCategorySlug(params: JobSearchParams, categories = categoriesData): JobSearchParams {
  if (!params.categorySlug) return params;
  const cat = categories.find((c) => c.slug === params.categorySlug);
  if (cat) return { ...params, categoryId: cat.id, categorySlug: undefined };
  return params;
}

export const jobsService = {
  /** @deprecated sync — use getAllRawAsync */
  getAllRaw(): Job[] {
    const userJobs = typeof window !== 'undefined' ? userJobsStore.getAll() : [];
    return [...userJobs, ...jobsData];
  },

  async getAllRawAsync(): Promise<Job[]> {
    return fetchAllJobs();
  },

  /** @deprecated sync */
  getById(id: string): Job | undefined {
    return this.getAllRaw().find((job) => job.id === id);
  },

  async getByIdAsync(id: string): Promise<Job | undefined> {
    if (isBackendEnabled()) {
      return firebaseJobsRepository.getById(id);
    }
    return this.getById(id);
  },

  async createFromForm(data: CreateJobFormData): Promise<Job> {
    const job = createJobFormToEntity(data);
    if (isBackendEnabled()) {
      return firebaseJobsRepository.insert(job);
    }
    return userJobsStore.add(job);
  },

  async getSearchFacets() {
    const active = await fetchActiveJobs();
    const labels = new Set<string>();
    active.forEach((job) => {
      labels.add(job.location.isRemote ? 'Remote' : job.location.label);
    });
    return {
      locations: [
        { value: 'all', label: 'All locations' },
        ...[...labels].sort().map((label) => ({ value: label, label })),
      ],
    };
  },

  async search(savedJobIds: Set<string>, params: JobSearchParams = {}): Promise<JobListItem[]> {
    const resolved = resolveCategorySlug({ ...DEFAULT_SEARCH_PARAMS, ...params });
    const filtered = (await fetchActiveJobs()).filter((job) => matchesSearchParams(job, resolved));
    const sorted = sortJobs(filtered, resolved.sort ?? 'newest');
    return toJobListItems(sorted, savedJobIds);
  },

  async listJobs(
    savedJobIds: Set<string>,
    filters: JobFilters | JobSearchParams = {}
  ): Promise<JobListItem[]> {
    if ('workTypes' in filters || 'schedules' in filters || 'sort' in filters) {
      return this.search(savedJobIds, filters as JobSearchParams);
    }

    const legacy = filters as JobFilters;
    const includeAllStatuses = Boolean(legacy.posterId);
    const pool = includeAllStatuses ? await fetchAllJobs() : await fetchActiveJobs();
    const filtered = pool.filter((job) => applyLegacyFilters(job, legacy));
    return toJobListItems(filtered, savedJobIds);
  },

  async searchJobs(
    savedJobIds: Set<string>,
    filters: JobFilters | JobSearchParams = {}
  ): Promise<JobListItem[]> {
    return this.listJobs(savedJobIds, filters);
  },

  async getFeaturedJobs(savedJobIds: Set<string>, limit = 2): Promise<JobListItem[]> {
    return toJobListItems(
      (await fetchActiveJobs()).filter((j) => j.isFeatured),
      savedJobIds
    ).slice(0, limit);
  },

  async getRecentJobs(savedJobIds: Set<string>, limit = 4): Promise<JobListItem[]> {
    return sortJobs(await fetchActiveJobs(), 'newest')
      .slice(0, limit)
      .map((job) => toJobListItem(job, savedJobIds));
  },

  async getSimilarJobs(
    jobId: string,
    savedJobIds: Set<string>,
    limit = 3
  ): Promise<JobListItem[]> {
    const job = await this.getByIdAsync(jobId);
    if (!job) return [];

    return toJobListItems(
      (await fetchActiveJobs())
        .filter((j) => j.id !== jobId && j.categoryId === job.categoryId)
        .slice(0, limit),
      savedJobIds
    );
  },

  async getMyJobPosts(userId: string, savedJobIds: Set<string>): Promise<JobListItem[]> {
    return this.listJobs(savedJobIds, { posterId: userId });
  },

  async getJobDetail(id: string, savedJobIds: Set<string>): Promise<JobListItem | undefined> {
    const job = await this.getByIdAsync(id);
    if (!job) return undefined;
    return toJobListItem(job, savedJobIds);
  },

  async countJobs(filters: JobFilters | JobSearchParams = {}): Promise<number> {
    if ('workTypes' in filters || 'schedules' in filters) {
      const resolved = resolveCategorySlug(filters as JobSearchParams);
      return (await fetchActiveJobs()).filter((job) => matchesSearchParams(job, resolved)).length;
    }
    const legacy = filters as JobFilters;
    const includeAllStatuses = Boolean(legacy.posterId);
    const pool = includeAllStatuses ? await fetchAllJobs() : await fetchActiveJobs();
    return pool.filter((job) => applyLegacyFilters(job, legacy)).length;
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<void> {
    if (isBackendEnabled()) {
      await firebaseJobsRepository.updateStatus(id, status);
      return;
    }
    if (userJobsStore.update(id, { status })) return;
    jobModerationStore.setStatus(id, status);
  },

  async deleteJob(id: string): Promise<void> {
    if (isBackendEnabled()) {
      await firebaseJobsRepository.delete(id);
      return;
    }
    if (!userJobsStore.remove(id)) {
      jobModerationStore.markDeleted(id);
    }
  },
};
