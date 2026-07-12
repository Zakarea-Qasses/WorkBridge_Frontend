import { apiRequest } from '@/app/api/client';

import type { ProfileReview, UserReviewsResponse, Contract, ReviewPayload } from '../../types';

export type { Contract, ReviewPayload, ProfileReview } from '../../types';

export async function getContract(id: number) {
  const response = await apiRequest<{ contract: Contract }>(`/contracts/${id}`);
  return response.contract;
}

export async function createReview(payload: ReviewPayload) {
  const response = await apiRequest<{ message: string; review: ProfileReview }>('/reviews', {
    method: 'POST',
    body: payload,
  });
  return response.review;
}

export async function updateReview(
  id: string | number,
  payload: Omit<Partial<ReviewPayload>, 'contract_id'>,
) {
  const response = await apiRequest<{ message: string; review: ProfileReview }>(`/reviews/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.review;
}

export function deleteReview(id: string | number) {
  return apiRequest<{ message: string }>(`/reviews/${id}`, { method: 'DELETE' });
}

export function getUserReviews(userId: string | number) {
  return apiRequest<UserReviewsResponse>(`/users/${userId}/reviews`);
}
