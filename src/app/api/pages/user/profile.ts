import { apiRequest } from '@/app/api/client';

import type { PersonalProfile, PersonalProfileResponse } from '../../types';

export type { PersonalProfile } from '../../types';

export async function getProfile() {
  return apiRequest<PersonalProfileResponse>('/profile');
}

export async function updateProfile(payload: {
  name: string;
  job_title: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  bio: string | null;
  skills: string[];
}) {
  const response = await apiRequest<{ message: string; profile: PersonalProfile }>('/profile', {
    method: 'PUT',
    body: payload,
  });
  return response.profile;
}
