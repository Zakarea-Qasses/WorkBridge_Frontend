import { apiRequest } from '@/app/api/client';

export function forgotPassword(payload: { email: string }) {
  return apiRequest<{ message: string }>('/forgot-password', {
    method: 'POST',
    body: payload,
  });
}
