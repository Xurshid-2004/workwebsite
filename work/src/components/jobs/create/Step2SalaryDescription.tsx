'use client';

import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DollarSign } from 'lucide-react';

interface Step2SalaryDescriptionProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
  onChange: <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => void;
}

export function Step2SalaryDescription({ form, errors, onChange }: Step2SalaryDescriptionProps) {
  const isHourly = form.scheduleType === 'freelance' || form.scheduleType === 'part-time';
  const salaryLabel = isHourly ? 'Hourly rate (USD)' : 'Annual salary (USD)';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-secondary)]">Salary & description</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Set compensation and describe the role clearly.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--color-secondary)] mb-1.5 flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-[var(--color-success)]" />
          {salaryLabel}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="From"
            type="number"
            min={0}
            placeholder={isHourly ? '25' : '60000'}
            value={form.salaryMin}
            onChange={(e) => onChange('salaryMin', e.target.value)}
            error={errors.salaryMin}
          />
          <Input
            label="To"
            type="number"
            min={0}
            placeholder={isHourly ? '45' : '90000'}
            value={form.salaryMax}
            onChange={(e) => onChange('salaryMax', e.target.value)}
            error={errors.salaryMax}
          />
        </div>
      </div>

      <Textarea
        label="Description"
        rows={4}
        placeholder="Describe the role, team, and what success looks like..."
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={errors.description}
      />

      <Textarea
        label="Responsibilities"
        rows={4}
        placeholder={'One responsibility per line\ne.g. Lead design reviews\nCollaborate with engineering'}
        value={form.responsibilities}
        onChange={(e) => onChange('responsibilities', e.target.value)}
        error={errors.responsibilities}
        hint="Enter one item per line"
      />

      <Textarea
        label="Requirements"
        rows={4}
        placeholder={'One requirement per line\ne.g. 3+ years UX experience\nPortfolio required'}
        value={form.requirements}
        onChange={(e) => onChange('requirements', e.target.value)}
        error={errors.requirements}
        hint="Enter one item per line"
      />
    </div>
  );
}
