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
  const salaryLabel = 'Oylik maosh (USD)';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-secondary)]">Maosh va tavsif</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Maoshni belgilang va lavozimni aniq tavsiflang.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--color-secondary)] mb-1.5 flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-[var(--color-success)]" />
          {salaryLabel}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Dan"
            type="number"
            min={0}
            placeholder="500"
            value={form.salaryMin}
            onChange={(e) => onChange('salaryMin', e.target.value)}
            error={errors.salaryMin}
          />
          <Input
            label="Gacha"
            type="number"
            min={0}
            placeholder="1500"
            value={form.salaryMax}
            onChange={(e) => onChange('salaryMax', e.target.value)}
            error={errors.salaryMax}
          />
        </div>
      </div>

      <Textarea
        label="Tavsif"
        rows={4}
        placeholder="Lavozim, jamoa va kutilayotgan natijalarni yozing..."
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={errors.description}
        hint={`${form.description.trim().length} ta belgi · kamida 20`}
      />
      <Textarea
        label="Majburiyatlar"
        rows={4}
        placeholder={'Har bir qatorga bitta band\nmasalan, Dizayn ko‘riklarini boshqarish\nMuhandislar bilan hamkorlik'}
        value={form.responsibilities}
        onChange={(e) => onChange('responsibilities', e.target.value)}
        error={errors.responsibilities}
        hint="Har bir qatorga bitta band"
      />

      <Textarea
        label="Talablar"
        rows={4}
        placeholder={'Har bir qatorga bitta talab\nmasalan, 3+ yil UX tajriba\nPortfolio talab qilinadi'}
        value={form.requirements}
        onChange={(e) => onChange('requirements', e.target.value)}
        error={errors.requirements}
        hint="Har bir qatorga bitta band"
      />
    </div>
  );
}
