import { apiRequest } from '@/app/api/client';

import type { Category, Service, ServicePayload } from '../../types';

export type { Category } from '../../types';

export async function createService(payload: ServicePayload) {
  const response = await apiRequest<{ message: string; service: Service }>('/services', {
    method: 'POST',
    body: payload,
  });
  return response.service;
}

export async function getCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/categories');
  return response.categories;
}
