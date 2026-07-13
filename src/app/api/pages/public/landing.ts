import { apiRequest } from '@/app/api/client';
import type { JobPost, PaginatedResponse, Service, UserProject } from '@/app/api/types';

export interface LandingData {
  jobs: JobPost[];
  projects: UserProject[];
  services: Service[];
}

export async function getLandingData(): Promise<LandingData> {
  const [jobsResponse, projectsResponse, servicesResponse] = await Promise.all([
    apiRequest<{ jobs: PaginatedResponse<JobPost> | JobPost[] }>('/jobs'),
    apiRequest<{ projects: PaginatedResponse<UserProject> }>('/projects'),
    apiRequest<{ services: Service[] }>('/services'),
  ]);

  return {
    jobs: Array.isArray(jobsResponse.jobs) ? jobsResponse.jobs : jobsResponse.jobs.data,
    projects: projectsResponse.projects.data,
    services: servicesResponse.services,
  };
}
