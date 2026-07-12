import { apiRequest } from '@/app/api/client';

import type { Category, PaginatedResponse, Report, UserProject, CreateReportPayload } from '../../types';

export type { Category, UserProject } from '../../types';

export async function createReport(payload: CreateReportPayload) {
  const hasFiles = payload.attachments?.some((attachment) => attachment instanceof File);

  if (hasFiles) {
    const formData = new FormData();

    if (payload.target_type) formData.append('target_type', payload.target_type);
    if (payload.target_id !== undefined) formData.append('target_id', String(payload.target_id));
    if (payload.contract_id !== undefined && payload.contract_id !== null) {
      formData.append('contract_id', String(payload.contract_id));
    }
    if (payload.title !== undefined && payload.title !== null) formData.append('title', payload.title);
    if (payload.category) formData.append('category', payload.category);
    if (payload.priority) formData.append('priority', payload.priority);
    formData.append('description', payload.description);

    payload.attachments?.forEach((attachment) => {
      if (attachment instanceof File) {
        formData.append('attachments[]', attachment);
      } else if (attachment.trim()) {
        formData.append('attachment_references[]', attachment.trim());
      }
    });

    payload.attachment_references?.forEach((reference) => {
      if (reference.trim()) {
        formData.append('attachment_references[]', reference.trim());
      }
    });

    const response = await apiRequest<{ message: string; report: Report }>('/reports', {
      method: 'POST',
      body: formData,
    });
    return response.report;
  }

  const response = await apiRequest<{ message: string; report: Report }>('/reports', {
    method: 'POST',
    body: {
      ...payload,
      attachment_references:
        payload.attachment_references ||
        payload.attachments?.filter((attachment): attachment is string => typeof attachment === 'string') ||
        undefined,
      attachments: undefined,
    },
  });
  return response.report;
}

export async function getCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/categories');
  return response.categories;
}

export async function getProjects(params?: {
  page?: number;
  search?: string;
  status?: 'active' | 'paused' | 'closed';
  category_id?: number;
  governorate_id?: number;
  city_id?: number;
  min_price?: number;
  max_price?: number;
  type?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const response = await apiRequest<{ projects: PaginatedResponse<UserProject> }>(
    `/projects${query.toString() ? `?${query.toString()}` : ''}`,
  );
  return response.projects;
}
