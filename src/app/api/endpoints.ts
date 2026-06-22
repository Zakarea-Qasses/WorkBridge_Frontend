import { apiRequest } from '@/app/api/client';

export interface WorkBridgeUser {
  id: number;
  name: string;
  email: string;
  role: 'personal' | 'company' | 'admin' | string;
  email_verified_at?: string | null;
  status?: 'pending_review' | 'under_review' | 'active' | 'blocked';
  company?: {
    id: number;
    company_name?: string;
    is_verified?: boolean;
  } | null;
}

export interface LoginResponse {
  token: string;
  user: WorkBridgeUser;
  dashboard?: {
    role: WorkBridgeUser['role'];
    url: string;
  };
}

export interface Category {
  id: number;
  name: string;
}

export interface LocationOption {
  id: number;
  name: string;
}

export interface PersonalProfile {
  id: number;
  user_id: number;
  job_title: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
  skills: Array<{
    id: number;
    name: string;
  }>;
}

export interface PersonalDashboardResponse {
  message: string;
  role: 'personal';
  user: WorkBridgeUser;
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface ServiceOwner {
  id: number;
  name: string;
  role: string;
}

export interface Service {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string | null;
  price: number | string;
  delivery_days: number;
  created_at: string;
  updated_at: string;
  user?: ServiceOwner;
  category?: ServiceCategory;
}

export interface ServicePayload {
  title: string;
  category_id: number;
  price: number;
  delivery_days: number;
  description?: string | null;
}

export interface ServiceRequest {
  id: number;
  service_id: number;
  client_id: number;
  title: string;
  description: string;
  references: string | null;
  delivery_days: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  client?: Pick<WorkBridgeUser, 'id' | 'name' | 'email'>;
  service?: Service & { user?: Pick<WorkBridgeUser, 'id' | 'name' | 'email'> };
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ConversationUser {
  id: number;
  name: string;
}

export interface ConversationMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  type: 'text' | 'image' | 'file';
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: ConversationUser;
}

export interface Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  user1: ConversationUser;
  user2: ConversationUser;
  messages?: ConversationMessage[];
  unread_count?: number;
}

export interface Contract {
  id: number;
  client_id: number;
  freelancer_id: number;
  user_project_id: number | null;
  service_request_id: number | null;
  job_post_id: number | null;
  application_id: number | null;
  amount: number | string;
  commission_amount: number | string;
  freelancer_amount: number | string;
  status: 'pending' | 'funded' | 'in_progress' | 'completed' | 'canceled' | 'refunded' | 'dispute';
  funded_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  client: Pick<WorkBridgeUser, 'id' | 'name' | 'email'>;
  freelancer: Pick<WorkBridgeUser, 'id' | 'name' | 'email'>;
  project?: { id: number; title: string } | null;
  service_request?: { id: number; title: string } | null;
  job_post?: { id: number; title: string } | null;
}

function unwrapList<T>(value: T[] | PaginatedResponse<T>) {
  return Array.isArray(value) ? value : value.data;
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

export function verifyEmail(payload: { email: string; otp: string }) {
  return apiRequest<{ message: string }>('/email/verify', {
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

export async function refreshMe() {
  return me();
}

export function logout() {
  return apiRequest<{ message: string }>('/logout', { method: 'POST' });
}

export async function me() {
  const response = await apiRequest<{ user: WorkBridgeUser }>('/me');
  return response.user;
}

export async function getCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/categories');
  return response.categories;
}

export function getGovernorates() {
  return apiRequest<LocationOption[]>('/governorates');
}

export function getCitiesByGovernorate(governorateId: string | number) {
  return apiRequest<LocationOption[]>(`/governorates/${governorateId}/cities`);
}

export async function getServices() {
  const response = await apiRequest<{ services: Service[] }>('/services');
  return response.services;
}

export async function getService(id: string | number) {
  const response = await apiRequest<{ service: Service }>(`/services/${id}`);
  return response.service;
}

export async function createService(payload: ServicePayload) {
  const response = await apiRequest<{ message: string; service: Service }>('/services', {
    method: 'POST',
    body: payload,
  });
  return response.service;
}

export async function updateService(id: string | number, payload: Partial<ServicePayload>) {
  const response = await apiRequest<{ message: string; service: Service }>(`/services/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.service;
}

export function deleteService(id: string | number) {
  return apiRequest(`/services/${id}`, { method: 'DELETE' });
}

export function requestService(
  serviceId: string | number,
  payload: { title: string; description: string; references?: string | null; delivery_days: number },
) {
  return apiRequest<{ message: string; service_request: ServiceRequest }>(
    `/services/${serviceId}/requests`,
    { method: 'POST', body: payload },
  );
}

export async function getMyServiceRequests() {
  const response = await apiRequest<{
    requests: ServiceRequest[] | PaginatedResponse<ServiceRequest>;
  }>('/service-requests/my');
  return unwrapList(response.requests);
}

export async function getReceivedServiceRequests() {
  const response = await apiRequest<{
    requests: ServiceRequest[] | PaginatedResponse<ServiceRequest>;
  }>('/service-requests/received');
  return unwrapList(response.requests);
}

export function acceptServiceRequest(id: string | number) {
  return apiRequest(`/service-requests/${id}/accept`, { method: 'POST' });
}

export function rejectServiceRequest(id: string | number) {
  return apiRequest(`/service-requests/${id}/reject`, { method: 'POST' });
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}

export async function getConversations() {
  const response = await apiRequest<{
    conversations: Conversation[] | PaginatedResponse<Conversation>;
  }>('/conversations');
  return unwrapList(response.conversations);
}

export async function getConversationMessages(conversationId: number) {
  const response = await apiRequest<{
    messages: ConversationMessage[] | PaginatedResponse<ConversationMessage>;
  }>(`/conversations/${conversationId}/messages`);
  return unwrapList(response.messages);
}

export async function sendConversationMessage(conversationId: number, content: string) {
  const response = await apiRequest<{ message: string; data: ConversationMessage }>(
    `/conversations/${conversationId}/messages`,
    { method: 'POST', body: { content, type: 'text' } },
  );
  return response.data;
}

export function markConversationAsRead(conversationId: number) {
  return apiRequest(`/conversations/${conversationId}/read`, { method: 'POST' });
}

export async function getContracts() {
  const response = await apiRequest<{ contracts: Contract[] | PaginatedResponse<Contract> }>(
    '/contracts',
  );
  return unwrapList(response.contracts);
}

export async function getCompanyContracts() {
  const response = await apiRequest<{ contracts: Contract[] | PaginatedResponse<Contract> }>(
    '/company/contracts',
  );
  return unwrapList(response.contracts);
}

export function startContract(id: number) {
  return apiRequest(`/contracts/${id}/start`, { method: 'POST' });
}

export function completeContract(id: number) {
  return apiRequest(`/contracts/${id}/complete`, { method: 'POST' });
}

export function cancelContract(id: number) {
  return apiRequest(`/contracts/${id}/cancel`, { method: 'POST' });
}

export async function getJobs<T>() {
  const response = await apiRequest<{ jobs: T[] }>('/jobs');
  return response.jobs;
}

export async function getJob<T>(id: string | number) {
  const response = await apiRequest<{ job: T }>(`/jobs/${id}`);
  return response.job;
}

export function createJob(payload: Record<string, unknown>) {
  return apiRequest('/jobs', { method: 'POST', body: payload });
}

export function updateJob(id: string | number, payload: Record<string, unknown>) {
  return apiRequest(`/jobs/${id}`, { method: 'PUT', body: payload });
}

export function deleteJob(id: string | number) {
  return apiRequest(`/jobs/${id}`, { method: 'DELETE' });
}

export async function getProjects<T>() {
  const response = await apiRequest<{ projects: T[] }>('/projects');
  return response.projects;
}

export async function getProject<T>(id: string | number) {
  const response = await apiRequest<{ project: T }>(`/projects/${id}`);
  return response.project;
}

export function createProject(payload: Record<string, unknown>) {
  return apiRequest('/projects', { method: 'POST', body: payload });
}

export function updateProject(id: string | number, payload: Record<string, unknown>) {
  return apiRequest(`/projects/${id}`, { method: 'PUT', body: payload });
}

export function deleteProject(id: string | number) {
  return apiRequest(`/projects/${id}`, { method: 'DELETE' });
}

export function applyToProject(projectId: string | number) {
  return apiRequest(`/projects/${projectId}/applications`, { method: 'POST' });
}

export async function getProfile() {
  const response = await apiRequest<{ profile: PersonalProfile }>('/profile');
  return response.profile;
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

export async function getCompany<T>() {
  const response = await apiRequest<{ company: T }>('/company');
  return response.company;
}

export function updateCompany(payload: Record<string, unknown>) {
  return apiRequest('/company', { method: 'PUT', body: payload });
}

export function getDashboard<T>(role: WorkBridgeUser['role']) {
  const endpoint = role === 'personal' ? 'personal' : role;
  return apiRequest<T>(`/dashboard/${endpoint}`);
}

export function getPersonalDashboard() {
  return apiRequest<PersonalDashboardResponse>('/dashboard/personal');
}

export async function getWallet<T>() {
  const response = await apiRequest<{ wallet: T }>('/wallet');
  return response.wallet;
}

export async function getNotifications<T>() {
  const response = await apiRequest<{ notifications: { data?: T[] } | T[] }>('/notifications');
  return Array.isArray(response.notifications)
    ? response.notifications
    : response.notifications.data || [];
}

export async function getUnreadNotificationCount() {
  const response = await apiRequest<{ unread_count: number }>('/notifications/unread-count');
  return response.unread_count;
}

export interface AdminReviewUser extends WorkBridgeUser {
  profile?: unknown;
  company?: WorkBridgeUser['company'];
}

export interface AdminReviewBoard {
  pending_review: AdminReviewUser[];
  under_review: AdminReviewUser[];
  reviewed: AdminReviewUser[];
  counts: Record<string, number>;
}

export function getAdminUsers<T>() {
  return apiRequest<T>('/admin/users');
}

export function getAdminUserReviewBoard() {
  return apiRequest<AdminReviewBoard>('/admin/users/review-board');
}

export function approveAdminUser(id: string | number) {
  return apiRequest(`/admin/users/${id}/approve`, { method: 'POST' });
}

export function markAdminUserUnderReview(id: string | number) {
  return apiRequest(`/admin/users/${id}/under-review`, { method: 'POST' });
}

export function blockAdminUser(id: string | number) {
  return apiRequest(`/admin/users/${id}/block`, { method: 'POST' });
}

export function getAdminCompanies<T>() {
  return apiRequest<T>('/admin/companies');
}

export function getPendingAdminCompanies<T>() {
  return apiRequest<T>('/admin/companies/pending');
}

export function verifyAdminCompany(id: string | number) {
  return apiRequest(`/admin/companies/${id}/verify`, { method: 'POST' });
}

export function unverifyAdminCompany(id: string | number) {
  return apiRequest(`/admin/companies/${id}/unverify`, { method: 'POST' });
}
