'use client';

import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { Input } from '@/components/ui/Input';
import { MapLocationPicker } from '@/components/map/MapLocationPicker';

interface Step3ContactLocationProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
  onChange: <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => void;
  onChangeFields: (patch: Partial<CreateJobFormData>) => void;
}

export function Step3ContactLocation({ form, errors, onChange, onChangeFields }: Step3ContactLocationProps) {
  const isRemote = form.workType === 'remote';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-secondary)]">Aloqa va joylashuv</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Nomzodlar siz bilan qanday bogʻlanadi va ish qayerda joylashgan.
        </p>
      </div>

      <Input
        label="Telefon raqami"
        type="tel"
        placeholder="+998 90 123 45 67"
        value={form.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        error={errors.phone}
        autoComplete="tel"
      />

      <Input
        label="Manzil"
        placeholder={isRemote ? 'Masofaviy ish uchun ixtiyoriy' : 'Koʻcha, uy'}
        value={form.address}
        onChange={(e) => onChange('address', e.target.value)}
        error={errors.address}
        disabled={isRemote}
      />

      <Input
        label="Shahar / tuman"
        placeholder={isRemote ? 'Masofaviy' : 'masalan, Toshkent, Chilonzor'}
        value={form.cityDistrict}
        onChange={(e) => onChange('cityDistrict', e.target.value)}
        error={errors.cityDistrict}
      />

      <MapLocationPicker
        lat={form.mapLat}
        lng={form.mapLng}
        disabled={isRemote}
        onSelect={(lat, lng) => onChangeFields({ mapLat: lat, mapLng: lng })}
      />
    </div>
  );
}
