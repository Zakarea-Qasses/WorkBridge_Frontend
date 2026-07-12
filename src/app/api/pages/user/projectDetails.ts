import { apiRequest } from '@/app/api/client';

import type { Conversation, UserProject, ProjectApplication, ProjectApplicationPayload } from '../../types';

export type { UserProject } from '../../types';

export async function applyToProject(
  projectId: string | number,
  payload: ProjectApplicationPayload,
) {
  const response = await apiRequest<{
    message: string;
    application: ProjectApplication;
  }>(`/projects/${projectId}/applications`, { method: 'POST', body: payload });
  return response.application;
}

export async function getProject(id: string | number) {
  const response = await apiRequest<{ project: UserProject }>(`/projects/${id}`);
  return response.project;
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}
