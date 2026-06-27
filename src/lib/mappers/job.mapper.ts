import type { Job, JobListItem } from '@/types';
import { SCHEDULE_TYPE_LABELS, WORK_TYPE_LABELS } from '@/types';

export function formatSalary(job: Job): string {
  const { salaryMin, salaryMax, salaryCurrency, scheduleType } = job;
  const isHourly = scheduleType === 'freelance' || scheduleType === 'part-time';
  const prefix = salaryCurrency && salaryCurrency !== 'USD' ? `${salaryCurrency} ` : '$';

  if (isHourly) {
    return `${prefix}${salaryMin} - ${prefix}${salaryMax}/hr`;
  }

  const fmt = (n: number) =>
    n >= 1000 ? `${prefix}${Math.round(n / 1000)}k` : `${prefix}${n.toLocaleString()}`;

  return `${fmt(salaryMin)} - ${fmt(salaryMax)}`;
}

export function formatPostedAt(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return new Date(isoDate).toLocaleDateString();
}

export function buildJobTags(job: Job): string[] {
  const tags = [
    SCHEDULE_TYPE_LABELS[job.scheduleType],
    WORK_TYPE_LABELS[job.workType],
    ...job.skills.slice(0, 2),
  ];
  return [...new Set(tags)];
}

/** "Toshkent, Chilonzor" → "Toshkent"; falls back to the explicit city. */
export function deriveRegion(job: Job): string | undefined {
  if (job.location.city) return job.location.city;
  const label = job.location.label ?? '';
  return label.includes(',') ? label.split(',')[0].trim() : label || undefined;
}

export function toJobListItem(job: Job, savedJobIds: Set<string>): JobListItem {
  return {
    id: job.id,
    title: job.title,
    company: job.companyName,
    logo: job.companyLogo,
    location: job.location.label,
    salary: formatSalary(job),
    tags: buildJobTags(job),
    postedAt: formatPostedAt(job.createdAt),
    description: job.description,
    isSaved: savedJobIds.has(job.id),
    isFeatured: job.isFeatured,
    categoryId: job.categoryId,
    workType: job.workType,
    scheduleType: job.scheduleType,
    status: job.status,
    posterId: job.posterId,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    lat: job.location.lat,
    lng: job.location.lng,
    isRemote: job.location.isRemote,
    region: deriveRegion(job),
  };
}

export function toJobListItems(jobs: Job[], savedJobIds: Set<string>): JobListItem[] {
  return jobs.map((job) => toJobListItem(job, savedJobIds));
}
