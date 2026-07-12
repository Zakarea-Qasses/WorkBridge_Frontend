import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, UserNotification } from '../../types';

export type { UserNotification } from '../../types';

export function deleteNotification(id: string | number) {
  return apiRequest<{ message: string }>(`/notifications/${id}`, {
    method: 'DELETE',
  });
}

export async function getNotifications(page = 1) {
  const response = await apiRequest<{
    notifications: PaginatedResponse<UserNotification>;
  }>(`/notifications?page=${page}`);
  return response.notifications;
}

export async function getUnreadNotificationCount() {
  const response = await apiRequest<{ unread_count: number | string }>(
    '/notifications/unread-count',
  );
  const count = Number(response.unread_count);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

export function markAllNotificationsAsRead() {
  return apiRequest<{ message: string; updated_count: number }>(
    '/notifications/read-all',
    { method: 'POST' },
  );
}

export async function markNotificationAsRead(id: string | number) {
  const response = await apiRequest<{
    message: string;
    notification: UserNotification;
  }>(`/notifications/${id}/read`, { method: 'POST' });
  return response.notification;
}
