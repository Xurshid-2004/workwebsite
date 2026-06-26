'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateJobFormData, CreateJobFormErrors, CreateJobStep } from '@/types';
import { EMPTY_CREATE_JOB_FORM } from '@/types';
import {
  hasErrors,
  validateCreateJobForm,
  validateCreateJobStep,
} from '@/lib/validations/create-job.validation';
import { jobsService } from '@/services/jobs.service';
import { appToast } from '@/lib/feedback/toast';

function findFirstInvalidStep(form: CreateJobFormData): CreateJobStep | null {
  for (let step = 1; step <= 3; step++) {
    const stepErrors = validateCreateJobStep(step as CreateJobStep, form);
    if (hasErrors(stepErrors)) return step as CreateJobStep;
  }
  return null;
}

function firstErrorMessage(errors: CreateJobFormErrors): string | undefined {
  return Object.values(errors).find((message): message is string => Boolean(message));
}

const STEP_LABELS: Record<CreateJobStep, string> = {
  1: 'Basic info',
  2: 'Salary & details',
  3: 'Contact & location',
  4: 'Preview',
};

export function useCreateJob() {
  const router = useRouter();
  const [step, setStep] = useState<CreateJobStep>(1);
  const [form, setForm] = useState<CreateJobFormData>(EMPTY_CREATE_JOB_FORM);
  const [errors, setErrors] = useState<CreateJobFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const updateFields = useCallback((patch: Partial<CreateJobFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof CreateJobFormData)[]).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const stepErrors = validateCreateJobStep(step, form);
    setErrors(stepErrors);
    return !hasErrors(stepErrors);
  }, [form, step]);

  const goNext = useCallback(() => {
    const stepErrors = validateCreateJobStep(step, form);
    if (hasErrors(stepErrors)) {
      setErrors(stepErrors);
      const message = firstErrorMessage(stepErrors);
      appToast.validation(message ?? 'Please complete all required fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setStep((s) => Math.min(4, s + 1) as CreateJobStep);
  }, [form, step]);

  const goBack = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1) as CreateJobStep);
  }, []);

  const goToStep = useCallback((target: CreateJobStep) => {
    if (target < step) {
      setErrors({});
      setStep(target);
      return;
    }

    for (let s = 1; s < target; s++) {
      const stepErrors = validateCreateJobStep(s as CreateJobStep, form);
      if (hasErrors(stepErrors)) {
        setErrors(stepErrors);
        setStep(s as CreateJobStep);
        return;
      }
    }

    setErrors({});
    setStep(target);
  }, [form, step]);

  const submit = useCallback(async () => {
    const allErrors = validateCreateJobForm(form);
    setErrors(allErrors);
    if (hasErrors(allErrors)) {
      const invalidStep = findFirstInvalidStep(form);
      if (invalidStep) setStep(invalidStep);
      const message = firstErrorMessage(allErrors);
      appToast.validation(message ?? 'Please fix the highlighted fields before publishing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const job = await jobsService.createFromForm(form);
      appToast.success('Your job ad has been published!');
      router.push(`/job/${job.id}`);
    } catch (err) {
      appToast.error(err, 'Could not publish your job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, router]);

  const stepMeta = useMemo(
    () => ({
      current: step,
      total: 4 as const,
      label: STEP_LABELS[step],
      isFirst: step === 1,
      isLast: step === 4,
    }),
    [step]
  );

  return {
    form,
    errors,
    step,
    stepMeta,
    isSubmitting,
    updateField,
    updateFields,
    goNext,
    goBack,
    goToStep,
    submit,
    validateCurrentStep,
  };
}
