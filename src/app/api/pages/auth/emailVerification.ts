import { apiRequest } from '@/app/api/client';

export function resendEmailVerification(payload: { email: string }) {
  return apiRequest<{ message: string }>('/email/resend', {
    method: 'POST',
    body: payload,
  });
}

export function verifyEmail(payload: { email: string; otp: string }) {
  return apiRequest<{ message: string }>('/email/verify', {
    method: 'POST',
    body: payload,
  });
}
