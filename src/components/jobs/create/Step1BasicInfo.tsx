'use client';

import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { WORK_TYPE_LABELS, SCHEDULE_TYPE_LABELS } from '@/types';
import type { WorkType, ScheduleType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCategories } from '@/hooks/useCategories';

interface Step1BasicInfoProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
  onChange: <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => void;
}

const WORK_TYPE_OPTIONS = [
  { value: '', label: 'Ish turini tanlang' },
  ...(Object.entries(WORK_TYPE_LABELS) as [WorkType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const SCHEDULE_OPTIONS = [
  { value: '', label: 'Jadvalni tanlang' },
  ...(Object.entries(SCHEDULE_TYPE_LABELS) as [ScheduleType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export function Step1BasicInfo({ form, errors, onChange }: Step1BasicInfoProps) {
  const { data: categories, isLoading } = useCategories();
  const categoryOptions = [
    { value: '', label: isLoading ? 'Yuklanmoqda…' : 'Kategoriyani tanlang' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-secondary)]">Asosiy maʼlumot</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Qanday lavozimga odam izlayotganingizni yozing.
        </p>
      </div>

      <Input
        label="Lavozim nomi"
        placeholder="masalan, Senior UI/UX Dizayner"
        value={form.title}
        onChange={(e) => onChange('title', e.target.value)}
        error={errors.title}
        autoFocus
      />

      <Select
        label="Kategoriya"
        options={categoryOptions}
        value={form.categoryId}
        onChange={(e) => onChange('categoryId', e.target.value)}
        error={errors.categoryId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Ish turi"
          options={WORK_TYPE_OPTIONS}
          value={form.workType}
          onChange={(e) => onChange('workType', e.target.value as CreateJobFormData['workType'])}
          error={errors.workType}
        />

        <Select
          label="Jadval"
          options={SCHEDULE_OPTIONS}
          value={form.scheduleType}
          onChange={(e) =>
            onChange('scheduleType', e.target.value as CreateJobFormData['scheduleType'])
          }
          error={errors.scheduleType}
        />
      </div>
    </div>
  );
}
