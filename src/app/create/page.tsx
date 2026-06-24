'use client';

import { CreateJobWizard } from '@/components/jobs/create/CreateJobWizard';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function CreateJobPage() {
  return (
    <RequireAuth>
      <CreateJobWizard />
    </RequireAuth>
  );
}
