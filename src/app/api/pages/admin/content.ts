import { apiRequest } from '@/app/api/client';

import type { Category, Service, PaginatedResponse, JobPost, UserProject, AdminContentType, AdminContentStatus, AdminContentQuery } from '../../types';

export type { AdminContentStatus, AdminContentType, Category, JobPost, PaginatedResponse, Service, UserProject } from '../../types';

function buildAdminContentQuery(params?: AdminContentQuery) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function createAdminContentCategory(name: string) {
  const response = await apiRequest<{ message: string; category: Category }>(
    '/admin/content/categories',
    { method: 'POST', body: { name } },
  );
  return response.category;
}

export function deleteAdminContentCategory(id: string | number) {
  return apiRequest<{ message: string }>(`/admin/content/categories/${id}`, {
    method: 'DELETE',
  });
}

export function deleteAdminContentJob(id: string | number) {
  return apiRequest(`/admin/content/jobs/${id}`, { method: 'DELETE' });
}

export function deleteAdminContentProject(id: string | number) {
  return apiRequest(`/admin/content/projects/${id}`, { method: 'DELETE' });
}

export function deleteAdminContentService(id: string | number) {
  return apiRequest(`/admin/content/services/${id}`, { method: 'DELETE' });
}

export async function getAdminContentCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/admin/content/categories');
  return response.categories;
}

export async function getAdminContentJobs(params?: AdminContentQuery) {
  const query = buildAdminContentQuery(params);
  const response = await apiRequest<{ jobs: PaginatedResponse<JobPost> }>(
    `/admin/content/jobs${query ? `?${query}` : ''}`,
  );
  return response.jobs;
}

export async function getAdminContentProjects(params?: AdminContentQuery) {
  const query = buildAdminContentQuery(params);
  const response = await apiRequest<{ projects: PaginatedResponse<UserProject> }>(
    `/admin/content/projects${query ? `?${query}` : ''}`,
  );
  return response.projects;
}

export async function getAdminContentServices(params?: AdminContentQuery) {
  const query = buildAdminContentQuery(params);
  const response = await apiRequest<{ services: PaginatedResponse<Service> }>(
    `/admin/content/services${query ? `?${query}` : ''}`,
  );
  return response.services;
}

export async function updateAdminContentCategory(id: string | number, name: string) {
  const response = await apiRequest<{ message: string; category: Category }>(
    `/admin/content/categories/${id}`,
    { method: 'PUT', body: { name } },
  );
  return response.category;
}

export function updateAdminJobStatus(id: string | number, status: AdminContentStatus) {
  return apiRequest(`/admin/content/jobs/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function updateAdminProjectStatus(id: string | number, status: AdminContentStatus) {
  return apiRequest(`/admin/content/projects/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function updateAdminServiceStatus(id: string | number, status: AdminContentStatus) {
  return apiRequest(`/admin/content/services/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}
