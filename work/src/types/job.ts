import type { JobStatus, ScheduleType, WorkType } from './enums';
import type { Location } from './location';
import type { ScheduleFilter } from './search';

/** Canonical job entity — mirrors a future database row */
export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  categoryId: string;
  posterId: string;
  description: string;
  requirements: string[];
  status: JobStatus;
  workType: WorkType;
  scheduleType: ScheduleType;
  schedulePattern: ScheduleFilter;
  location: Location;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  skills: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  /** Extended fields for user-posted jobs */
  responsibilities?: string[];
  contactPhone?: string;
  address?: string;
  district?: string;
}

/** Flattened job shape for list/card UI — produced by the service layer */
export interface JobListItem {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  tags: string[];
  postedAt: string;
  description: string;
  isSaved: boolean;
  isFeatured: boolean;
  categoryId: string;
  workType: WorkType;
  scheduleType: ScheduleType;
  status: JobStatus;
  posterId: string;
  salaryMin: number;
  salaryMax: number;
}
