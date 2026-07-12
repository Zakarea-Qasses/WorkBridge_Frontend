import { apiRequest } from '@/app/api/client';

import type { Category, Service, Conversation, Report, CreateReportPayload } from '../../types';

export type { Service } from '../../types';

export async function createReport(payload: CreateReportPayload) {
  const hasFiles = payload.attachments?.some((attachment) => attachment instanceof File);

  if (hasFiles) {
    const formData = new FormData();

    if (payload.target_type) formData.append('target_type', payload.target_type);
    if (payload.target_id !== undefined) formData.append('target_id', String(payload.target_id));
    if (payload.contract_id !== undefined && payload.contract_id !== null) {
      formData.append('contract_id', String(payload.contract_id));
    }
    if (payload.title !== undefined && payload.title !== null) formData.append('title', payload.title);
    if (payload.category) formData.append('category', payload.category);
    if (payload.priority) formData.append('priority', payload.priority);
    formData.append('description', payload.description);

    payload.attachments?.forEach((attachment) => {
      if (attachment instanceof File) {
        formData.append('attachments[]', attachment);
      } else if (attachment.trim()) {
        formData.append('attachment_references[]', attachment.trim());
      }
    });

    payload.attachment_references?.forEach((reference) => {
      if (reference.trim()) {
        formData.append('attachment_references[]', reference.trim());
      }
    });

    const response = await apiRequest<{ message: string; report: Report }>('/reports', {
      method: 'POST',
      body: formData,
    });
    return response.report;
  }

  const response = await apiRequest<{ message: string; report: Report }>('/reports', {
    method: 'POST',
    body: {
      ...payload,
      attachment_references:
        payload.attachment_references ||
        payload.attachments?.filter((attachment): attachment is string => typeof attachment === 'string') ||
        undefined,
      attachments: undefined,
    },
  });
  return response.report;
}

export async function getServices() {
  const response = await apiRequest<{ services: Service[] }>('/services');
  return response.services;
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}
