import { apiRequest } from '@/app/api/client';

import type { Category, Service, ServicePayload } from '../../types';

export type { Category, Service } from '../../types';

export function deleteService(id: string | number) {
  return apiRequest(`/services/${id}`, { method: 'DELETE' });
}

export async function getCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/categories');
  return response.categories;
}

export async function getServices() {
  const response = await apiRequest<{ services: Service[] }>('/services');
  return response.services;
}

export async function updateService(id: string | number, payload: Partial<ServicePayload>) {
  const response = await apiRequest<{ message: string; service: Service }>(`/services/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.service;
}
