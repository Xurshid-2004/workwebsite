export type JobStatus = 'draft' | 'pending' | 'active' | 'closed';

export type WorkType = 'remote' | 'onsite' | 'hybrid';

export type ScheduleType = 'full-time' | 'part-time' | 'freelance' | 'contract';

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  active: 'Active',
  closed: 'Closed',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  remote: 'Remote',
  onsite: 'On-site',
  hybrid: 'Hybrid',
};

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  freelance: 'Freelance',
  contract: 'Contract',
};
