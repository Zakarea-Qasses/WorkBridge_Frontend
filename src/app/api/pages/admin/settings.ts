import { apiRequest } from '@/app/api/client';

import type { AdminSettings } from '../../types';

export type { AdminSettings } from '../../types';

export async function getAdminSettings() {
  const response = await apiRequest<{ settings: AdminSettings }>('/admin/settings');
  return response.settings;
}

export async function updateAdminSettings(payload: AdminSettings) {
  const response = await apiRequest<{ message: string; settings: AdminSettings }>(
    '/admin/settings',
    { method: 'PUT', body: payload },
  );
  return response.settings;
}
