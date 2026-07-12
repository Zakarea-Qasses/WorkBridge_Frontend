import { apiRequest } from '@/app/api/client';

import type { PersonalProfile, PersonalProfileResponse, ProfileReview, UserReviewsResponse } from '../../types';

export type { PersonalProfile, ProfileReview } from '../../types';

export async function getProfile() {
  return apiRequest<PersonalProfileResponse>('/profile');
}

export async function getPublicProfile(userId: string | number) {
  const response = await apiRequest<
    PersonalProfileResponse & {
      reviews?: ProfileReview[];
    }
  >(`/users/${userId}/profile`);

  return {
    ...response,
    reviews: response.reviews || [],
  };
}

export function getUserReviews(userId: string | number) {
  return apiRequest<UserReviewsResponse>(`/users/${userId}/reviews`);
}
