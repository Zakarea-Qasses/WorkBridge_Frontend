import { apiRequest } from '@/app/api/client';

import type { Report, ReportAttachment, ReportDecisionPayload } from '../../types';

export type { Report, ReportAttachment, ReportDecisionPayload } from '../../types';

export async function getAllReports() {
  const response = await apiRequest<{ reports: Report[] }>('/reports');
  return response.reports;
}

export async function updateReportDecision(id: string | number, payload: ReportDecisionPayload) {
  const response = await apiRequest<{ message: string; report: Report }>(
    `/reports/${id}/decision`,
    { method: 'PUT', body: payload },
  );
  return response.report;
}
