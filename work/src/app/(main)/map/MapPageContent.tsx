'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { JobMap } from '@/components/map/JobMap';
import { mapService } from '@/services';
import { useMemo } from 'react';

export function MapPageContent() {
  const markers = useMemo(() => mapService.getMarkersForActiveJobs(), []);
  const jobCount = mapService.getActiveJobCount();

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] md:h-[calc(100vh-2rem)] md:page-container md:!py-0">
      <div className="page-container pb-4 md:pb-4 shrink-0">
        <PageHeader title="Jobs on Map" subtitle={`${jobCount} opportunities near you`} />
      </div>

      <div className="flex-1 mx-4 sm:mx-6 md:mx-0 mb-4 md:mb-0 min-h-[400px]">
        <JobMap
          markers={markers}
          jobCount={jobCount}
          title="All active jobs"
          className="h-full"
        />
      </div>
    </div>
  );
}
