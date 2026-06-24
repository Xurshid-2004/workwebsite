'use client';

import { MapPin } from 'lucide-react';
import type { MapCoordinates } from '@/types';
import { pickerDemoPoints } from '@/lib/map/coordinates';
import { mapService } from '@/services/map.service';
import { JobMap } from '@/components/map/JobMap';
import { cn } from '@/lib/utils';

interface MapLocationPickerProps {
  lat?: number;
  lng?: number;
  disabled?: boolean;
  onSelect: (lat: number, lng: number) => void;
}

export function MapLocationPicker({ lat, lng, disabled, onSelect }: MapLocationPickerProps) {
  const hasSelection = lat !== undefined && lng !== undefined;
  const pickerPoints = pickerDemoPoints();

  const markers = hasSelection
    ? [mapService.getPickerMarker({ lat: lat!, lng: lng! })]
    : [];

  return (
    <div className={cn(disabled && 'opacity-60 pointer-events-none')}>
      <p className="text-sm font-medium text-[var(--color-secondary)] mb-1.5">Map location</p>

      {disabled ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-gray-50 p-6 text-center">
          <MapPin className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--color-muted)]">
            Map picker is not needed for fully remote roles.
          </p>
        </div>
      ) : (
        <>
          <JobMap
            markers={markers}
            mode="picker"
            onPickerSelect={(coords: MapCoordinates) => onSelect(coords.lat, coords.lng)}
            pickerPoints={pickerPoints}
            showHeader={false}
            showLegend={false}
            showProviderBadge
            className="aspect-[16/10] sm:aspect-[2/1] min-h-0"
          />
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {hasSelection ? (
              <>
                Selected: {lat!.toFixed(4)}, {lng!.toFixed(4)} — demo coordinates until a map API is
                connected.
              </>
            ) : (
              <>Tap a point on the map to set a demo location (placeholder).</>
            )}
          </p>
        </>
      )}
    </div>
  );
}
