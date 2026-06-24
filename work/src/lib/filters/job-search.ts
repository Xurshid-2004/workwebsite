import type { Job } from '@/types';
import type {
  JobSearchParams,
  JobSortOption,
  ScheduleFilter,
  WorkTypeFilter,
  SalaryRangeOption,
} from '@/types';

export const DEFAULT_SEARCH_PARAMS: JobSearchParams = {
  query: '',
  sort: 'newest',
  workTypes: [],
  schedules: [],
};

export const WORK_TYPE_FILTER_OPTIONS: { id: WorkTypeFilter; label: string }[] = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'temporary', label: 'Temporary' },
  { id: 'remote', label: 'Remote' },
  { id: 'flexible', label: 'Flexible' },
];

export const SCHEDULE_FILTER_OPTIONS: { id: ScheduleFilter; label: string }[] = [
  { id: 'standard', label: 'Standard (9–5)' },
  { id: 'flexible-hours', label: 'Flexible hours' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'night-shift', label: 'Night shift' },
];

export const SORT_OPTIONS: { id: JobSortOption; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'salary-desc', label: 'Highest salary' },
  { id: 'salary-asc', label: 'Lowest salary' },
];

export const SALARY_RANGE_OPTIONS: SalaryRangeOption[] = [
  { id: 'any', label: 'Any salary', min: 0, max: Infinity },
  { id: 'under-80', label: 'Under $80k', min: 0, max: 80000 },
  { id: '80-120', label: '$80k – $120k', min: 80000, max: 120000 },
  { id: '120-160', label: '$120k – $160k', min: 120000, max: 160000 },
  { id: '160-plus', label: '$160k+', min: 160000, max: Infinity },
];

export function matchesWorkTypeFilter(job: Job, filter: WorkTypeFilter): boolean {
  switch (filter) {
    case 'full-time':
      return job.scheduleType === 'full-time';
    case 'part-time':
      return job.scheduleType === 'part-time';
    case 'temporary':
      return job.scheduleType === 'contract' || job.scheduleType === 'freelance';
    case 'remote':
      return job.workType === 'remote' || job.location.isRemote;
    case 'flexible':
      return (
        job.workType === 'hybrid' ||
        job.schedulePattern === 'flexible-hours' ||
        job.scheduleType === 'freelance'
      );
    default:
      return true;
  }
}

export function isAnnualSalary(job: Job): boolean {
  return job.salaryMin >= 1000;
}

export function getComparableSalary(job: Job): number {
  if (!isAnnualSalary(job)) {
    return job.salaryMax * 40 * 52;
  }
  return job.salaryMax;
}

export function matchesSearchParams(job: Job, params: JobSearchParams): boolean {
  if (params.query?.trim()) {
    const q = params.query.toLowerCase().trim();
    if (!job.title.toLowerCase().includes(q)) return false;
  }

  if (params.categoryId && job.categoryId !== params.categoryId) return false;

  if (params.location && params.location !== 'all') {
    const loc = params.location.toLowerCase();
    const matches =
      job.location.label.toLowerCase().includes(loc) ||
      job.location.city?.toLowerCase().includes(loc) ||
      job.location.country?.toLowerCase().includes(loc) ||
      (loc === 'remote' && job.location.isRemote);
    if (!matches) return false;
  }

  if (params.salaryMin !== undefined || params.salaryMax !== undefined) {
    const min = params.salaryMin ?? 0;
    const max = params.salaryMax ?? Infinity;
    const comparable = getComparableSalary(job);
    if (comparable < min || comparable > max) return false;
  }

  if (params.workTypes && params.workTypes.length > 0) {
    const matchesAny = params.workTypes.some((wt) => matchesWorkTypeFilter(job, wt));
    if (!matchesAny) return false;
  }

  if (params.schedules && params.schedules.length > 0) {
    if (!params.schedules.includes(job.schedulePattern)) return false;
  }

  return true;
}

export function sortJobs(jobs: Job[], sort: JobSortOption = 'newest'): Job[] {
  const sorted = [...jobs];
  switch (sort) {
    case 'salary-desc':
      return sorted.sort((a, b) => getComparableSalary(b) - getComparableSalary(a));
    case 'salary-asc':
      return sorted.sort((a, b) => getComparableSalary(a) - getComparableSalary(b));
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function countActiveFilters(params: JobSearchParams): number {
  let count = 0;
  if (params.query?.trim()) count++;
  if (params.categoryId) count++;
  if (params.location && params.location !== 'all') count++;
  if (params.salaryMin !== undefined || (params.salaryMax !== undefined && params.salaryMax < Infinity))
    count++;
  if (params.workTypes?.length) count++;
  if (params.schedules?.length) count++;
  return count;
}
