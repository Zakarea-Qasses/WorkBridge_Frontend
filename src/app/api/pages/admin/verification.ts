import { apiRequest } from '@/app/api/client';

export function getAdminCompanies<T>() {
  return apiRequest<T>('/admin/companies');
}

export function getPendingAdminCompanies<T>() {
  return apiRequest<T>('/admin/companies/pending');
}

export function requestAdminCompanyDocuments(
  id: string | number,
  payload: { title: string; message: string },
) {
  return apiRequest(`/admin/companies/${id}/request-document`, {
    method: 'POST',
    body: {
      document_name: payload.title,
      reason: payload.message,
    },
  });
}

export function unverifyAdminCompany(id: string | number) {
  return apiRequest(`/admin/companies/${id}/unverify`, { method: 'POST' });
}

export function verifyAdminCompany(id: string | number) {
  return apiRequest(`/admin/companies/${id}/verify`, { method: 'POST' });
}
