import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, ConversationMessage, Conversation } from '../../types';

export type { Conversation, ConversationMessage } from '../../types';

function unwrapList<T>(value: T[] | PaginatedResponse<T>) {
  return Array.isArray(value) ? value : value.data;
}

export async function getConversationMessagesPage(conversationId: number, page = 1) {
  const response = await apiRequest<{
    messages: PaginatedResponse<ConversationMessage>;
  }>(`/conversations/${conversationId}/messages?page=${page}`);
  return response.messages;
}

export async function getConversations() {
  const response = await apiRequest<{
    conversations: Conversation[] | PaginatedResponse<Conversation>;
  }>('/conversations');
  return unwrapList(response.conversations);
}

export function markConversationAsRead(conversationId: number) {
  return apiRequest(`/conversations/${conversationId}/read`, { method: 'POST' });
}

export async function sendConversationMessage(conversationId: number, content: string) {
  const response = await apiRequest<{ message: string; data: ConversationMessage }>(
    `/conversations/${conversationId}/messages`,
    { method: 'POST', body: { content, type: 'text' } },
  );
  return response.data;
}
