import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, AdminReviewUser } from '../../types';

export type { AdminReviewUser, PaginatedResponse } from '../../types';

export function approveAdminUser(id: string | number) {
  return apiRequest(`/admin/users/${id}/approve`, { method: 'POST' });
}

export function blockAdminUser(id: string | number) {
  return apiRequest(`/admin/users/${id}/block`, { method: 'POST' });
}

export function getAdminUsers<T>() {
  return apiRequest<T>('/admin/users');
}

export function markAdminUserUnderReview(id: string | number) {
  return apiRequest(`/admin/users/${id}/under-review`, { method: 'POST' });
}
