import { apiRequest } from '@/app/api/client';

import type { PersonalDashboardResponse } from '../../types';

export type { PersonalDashboardResponse } from '../../types';

export function getPersonalDashboard() {
  return apiRequest<PersonalDashboardResponse>('/dashboard/personal');
}
