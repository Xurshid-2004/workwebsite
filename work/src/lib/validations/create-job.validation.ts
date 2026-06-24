import type { CreateJobFormData, CreateJobFormErrors, CreateJobStep } from '@/types';

function parseSalary(value: string): number | null {
  const n = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateCreateJobStep(
  step: CreateJobStep,
  data: CreateJobFormData
): CreateJobFormErrors {
  const errors: CreateJobFormErrors = {};

  if (step === 1) {
    if (!data.title.trim()) errors.title = 'Job title is required';
    else if (data.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

    if (!data.categoryId) errors.categoryId = 'Please select a category';
    if (!data.workType) errors.workType = 'Please select a work type';
    if (!data.scheduleType) errors.scheduleType = 'Please select a schedule';
  }

  if (step === 2) {
    const min = parseSalary(data.salaryMin);
    const max = parseSalary(data.salaryMax);

    if (min === null) errors.salaryMin = 'Enter a valid salary amount';
    if (max === null) errors.salaryMax = 'Enter a valid salary amount';
    if (min !== null && max !== null && min > max) {
      errors.salaryMax = 'Maximum must be greater than minimum';
    }

    if (!data.description.trim()) errors.description = 'Description is required';
    else if (data.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    if (!data.responsibilities.trim()) errors.responsibilities = 'Add at least one responsibility';
    else if (parseLines(data.responsibilities).length < 1) {
      errors.responsibilities = 'Add at least one responsibility (one per line)';
    }

    if (!data.requirements.trim()) errors.requirements = 'Add at least one requirement';
    else if (parseLines(data.requirements).length < 1) {
      errors.requirements = 'Add at least one requirement (one per line)';
    }
  }

  if (step === 3) {
    const phone = data.phone.replace(/\s/g, '');
    if (!phone) errors.phone = 'Phone number is required';
    else if (!/^\+?[\d\-()]{7,20}$/.test(phone)) {
      errors.phone = 'Enter a valid phone number';
    }

    const isRemote = data.workType === 'remote';

    if (!isRemote && !data.address.trim()) {
      errors.address = 'Address is required for on-site roles';
    }

    if (!data.cityDistrict.trim()) {
      errors.cityDistrict = isRemote ? 'Enter "Remote" or a city' : 'City or district is required';
    }
  }

  return errors;
}

export function validateCreateJobForm(data: CreateJobFormData): CreateJobFormErrors {
  return {
    ...validateCreateJobStep(1, data),
    ...validateCreateJobStep(2, data),
    ...validateCreateJobStep(3, data),
  };
}

export function hasErrors(errors: CreateJobFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export { parseLines, parseSalary };
