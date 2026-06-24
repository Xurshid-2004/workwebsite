'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { adminService } from '@/services/admin.service';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { Skeleton } from '@/components/ui/LoadingState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AdminLocationsPage() {
  const locationsQuery = useAsyncQuery(() => adminService.listLocations(), [], []);
  const [label, setLabel] = useState('');

  const addLocation = useCallback(async () => {
    if (!label.trim()) {
      toast.error('Label is required');
      return;
    }
    try {
      await adminService.createLocation(label);
      toast.success('Location added');
      setLabel('');
      locationsQuery.refetch();
    } catch {
      toast.error('Could not add location');
    }
  }, [label, locationsQuery]);

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        await adminService.updateLocation(id, { isActive: !isActive });
        toast.success('Location updated');
        locationsQuery.refetch();
      } catch {
        toast.error('Could not update location');
      }
    },
    [locationsQuery]
  );

  const removeLocation = useCallback(
    async (id: string) => {
      try {
        await adminService.deleteLocation(id);
        toast.success('Location removed');
        locationsQuery.refetch();
      } catch {
        toast.error('Could not remove location');
      }
    },
    [locationsQuery]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Locations</h2>
        <p className="text-sm text-slate-400 mt-1">Manage searchable location presets</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row gap-3">
        <Input
          label="Location label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Tashkent, Uzbekistan"
          className="flex-1"
        />
        <div className="flex items-end">
          <Button onClick={() => void addLocation()} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add location
          </Button>
        </div>
      </div>

      <QueryErrorBanner message={locationsQuery.error} onRetry={locationsQuery.refetch} />

      {locationsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-slate-900" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {locationsQuery.data.map((location) => (
            <div
              key={location.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-white">{location.label}</p>
                <p className="text-xs text-slate-500">{location.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleActive(location.id, location.isActive)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium',
                    location.isActive
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {location.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  type="button"
                  onClick={() => void removeLocation(location.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                  aria-label="Delete location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
