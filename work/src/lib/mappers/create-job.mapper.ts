import type { CreateJobFormData, Job, JobListItem } from '@/types';
import type { ScheduleFilter } from '@/types';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { toJobListItem } from '@/lib/mappers/job.mapper';
import { parseLines, parseSalary } from '@/lib/validations/create-job.validation';

function defaultSchedulePattern(scheduleType: CreateJobFormData['scheduleType']): ScheduleFilter {
  if (scheduleType === 'part-time' || scheduleType === 'freelance') return 'flexible-hours';
  return 'standard';
}

export function createJobFormToEntity(data: CreateJobFormData): Job {
  const user = usersService.getCurrentUser();
  const now = new Date().toISOString();
  const isRemote = data.workType === 'remote';
  const salaryMin = parseSalary(data.salaryMin) ?? 0;
  const salaryMax = parseSalary(data.salaryMax) ?? 0;
  const requirements = parseLines(data.requirements);
  const responsibilities = parseLines(data.responsibilities);
  const schedulePattern = defaultSchedulePattern(data.scheduleType);

  const locationLabel = isRemote
    ? 'Remote'
    : [data.cityDistrict, data.address].filter(Boolean).join(', ') || data.cityDistrict;

  return {
    id: `job-user-${Date.now()}`,
    title: data.title.trim(),
    companyId: user.companyId ?? 'company-freelance',
    companyName: user.name,
    companyLogo: user.avatarUrl,
    categoryId: data.categoryId,
    posterId: authService.getCurrentUserId(),
    description: data.description.trim(),
    requirements,
    responsibilities,
    status: 'pending',
    workType: data.workType as Job['workType'],
    scheduleType: data.scheduleType as Job['scheduleType'],
    schedulePattern,
    location: {
      label: locationLabel,
      city: isRemote ? undefined : data.cityDistrict.trim(),
      address: data.address.trim() || undefined,
      lat: data.mapLat,
      lng: data.mapLng,
      isRemote,
    },
    salaryMin,
    salaryMax,
    salaryCurrency: 'USD',
    skills: requirements.slice(0, 3),
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
    contactPhone: data.phone.trim(),
    address: data.address.trim() || undefined,
    district: data.cityDistrict.trim() || undefined,
  };
}

export function formDataToPreviewItem(data: CreateJobFormData, savedJobIds: Set<string>): JobListItem {
  const entity = createJobFormToEntity(data);
  entity.id = 'job-preview';
  return toJobListItem(entity, savedJobIds);
}
