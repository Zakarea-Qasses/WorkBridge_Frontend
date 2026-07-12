import { apiRequest } from '@/app/api/client';

import type { AdminDashboardResponse } from '../../types';

export type { AdminDashboardResponse } from '../../types';

export function getAdminDashboard() {
  return apiRequest<AdminDashboardResponse>('/dashboard/admin');
}
