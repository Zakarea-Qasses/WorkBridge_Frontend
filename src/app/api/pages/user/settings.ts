import { apiRequest } from '@/app/api/client';

import type { PersonalProfile, PersonalProfileResponse, CompanyProfile, UpdateCompanyProfilePayload, ContactPermission, UserSettings, PasswordUpdatePayload, AdminSettings } from '../../types';

export type { AdminSettings, ContactPermission, UserSettings, PersonalProfileResponse, CompanyProfile } from '../../types';

export function clearSettingsLocalData() {
  return apiRequest<{ message: string; deleted_notifications: number }>(
    '/settings/local-data',
    { method: 'DELETE' },
  );
}

export async function getAdminSettings() {
  const response = await apiRequest<{ settings: AdminSettings }>('/admin/settings');
  return response.settings;
}

export async function updateAdminSettings(payload: AdminSettings) {
  const response = await apiRequest<{ message: string; settings: AdminSettings }>(
    '/admin/settings',
    { method: 'PUT', body: payload },
  );
  return response.settings;
}

export async function getUserSettings() {
  const response = await apiRequest<{ settings: UserSettings }>('/settings');
  return response.settings;
}

export async function updateNotificationSettings(payload: UserSettings['notifications']) {
  const response = await apiRequest<{ message: string; settings: UserSettings }>(
    '/settings/notifications',
    { method: 'PUT', body: payload },
  );
  return response.settings;
}

export function updatePassword(payload: PasswordUpdatePayload) {
  return apiRequest<{ message: string }>('/settings/password', {
    method: 'PUT',
    body: payload,
  });
}

export async function updatePrivacySettings(payload: UserSettings['privacy']) {
  const response = await apiRequest<{ message: string; settings: UserSettings }>(
    '/settings/privacy',
    { method: 'PUT', body: payload },
  );
  return response.settings;
}

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

export async function getCompany<T = CompanyProfile>() {
  const response = await apiRequest<{ company: T }>('/company');
  return response.company;
}

export async function updateCompany(payload: UpdateCompanyProfilePayload) {
  if (payload.logo instanceof File) {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('company_name', payload.company_name);
    formData.append('website', payload.website || '');
    formData.append('location', payload.location || '');
    formData.append(
      'governorate_id',
      payload.governorate_id === null || payload.governorate_id === undefined
        ? ''
        : String(payload.governorate_id),
    );
    formData.append(
      'city_id',
      payload.city_id === null || payload.city_id === undefined ? '' : String(payload.city_id),
    );
    formData.append('description', payload.description || '');
    formData.append('phone', payload.phone || '');
    payload.skills.forEach((skill) => formData.append('skills[]', skill));
    formData.append('logo', payload.logo);

    const response = await apiRequest<{ message: string; company: CompanyProfile }>('/company', {
      method: 'POST',
      body: formData,
    });
    return response.company;
  }

  const response = await apiRequest<{ message: string; company: CompanyProfile }>('/company', {
    method: 'PUT',
    body: {
      company_name: payload.company_name,
      website: payload.website,
      location: payload.location,
      governorate_id: payload.governorate_id,
      city_id: payload.city_id,
      description: payload.description,
      phone: payload.phone,
      skills: payload.skills,
    },
  });
  return response.company;
}
