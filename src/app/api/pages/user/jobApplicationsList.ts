import { apiRequest } from '@/app/api/client';

import type { JobApplicationStatus, JobApplication } from '../../types';

export type { JobApplication, JobApplicationStatus } from '../../types';

export async function getMyJobApplications() {
  const response = await apiRequest<{ applications: JobApplication[] }>(
    '/my-job-applications',
  );
  return response.applications;
}
