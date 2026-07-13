import { apiRequest } from '@/app/api/client';

import type { Category, LocationOption } from '../../types';

export type { Category, LocationOption } from '../../types';

export function createProject(payload: Record<string, unknown>) {
  return apiRequest('/projects', { method: 'POST', body: payload });
}

export async function getCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/categories');
  return response.categories;
}

export function getCitiesByGovernorate(governorateId: string | number) {
  return apiRequest<LocationOption[]>(`/governorates/${governorateId}/cities`);
}

export function getGovernorates() {
  return apiRequest<LocationOption[]>('/governorates');
}
