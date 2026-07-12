import { apiRequest } from '@/app/api/client';

import type { WorkBridgeUser, LoginResponse } from '../../types';

export type { LoginResponse, WorkBridgeUser } from '../../types';

export function forgotPassword(payload: { email: string }) {
  return apiRequest<{ message: string }>('/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'personal' | 'company';
}) {
  return apiRequest<{ message: string; token?: string; user: WorkBridgeUser }>('/register', {
    method: 'POST',
    body: payload,
  });
}

export function resendEmailVerification(payload: { email: string }) {
  return apiRequest<{ message: string }>('/email/resend', {
    method: 'POST',
    body: payload,
  });
}

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

export function verifyEmail(payload: { email: string; otp: string }) {
  return apiRequest<{ message: string }>('/email/verify', {
    method: 'POST',
    body: payload,
  });
}

export const resendVerificationCode = resendEmailVerification;
