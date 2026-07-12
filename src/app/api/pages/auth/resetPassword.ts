import { apiRequest } from '@/app/api/client';

export function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return apiRequest<{ message: string }>('/reset-password', {
    method: 'POST',
    body: payload,
  });
}
