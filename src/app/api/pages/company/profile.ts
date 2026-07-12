import { apiRequest } from '@/app/api/client';

import type { LocationOption, CompanyProfile, UpdateCompanyProfilePayload } from '../../types';

export type { CompanyProfile, LocationOption } from '../../types';

export function getCitiesByGovernorate(governorateId: string | number) {
  return apiRequest<LocationOption[]>(`/governorates/${governorateId}/cities`);
}

export async function getCompany<T = CompanyProfile>() {
  const response = await apiRequest<{ company: T }>('/company');
  return response.company;
}

export function getGovernorates() {
  return apiRequest<LocationOption[]>('/governorates');
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
