import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, Conversation, JobApplicationStatus, JobPost, JobApplication } from '../../types';

export type { JobApplication, JobApplicationStatus, JobPost } from '../../types';

export async function getCompanyJobsPage(page = 1) {
  const response = await apiRequest<{
    jobs: PaginatedResponse<JobPost>;
  }>(`/company/jobs?page=${page}`);
  return response.jobs;
}

export async function getJobApplications(jobId: string | number) {
  const response = await apiRequest<{ applications: JobApplication[] }>(
    `/jobs/${jobId}/applications`,
  );
  return response.applications;
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}

export async function updateJobApplicationStatus(
  applicationId: string | number,
  status: JobApplicationStatus,
) {
  const response = await apiRequest<{ application: JobApplication }>(
    `/job-applications/${applicationId}/status`,
    { method: 'PATCH', body: { status } },
  );
  return response.application;
}
