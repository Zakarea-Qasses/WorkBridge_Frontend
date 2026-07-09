import { apiRequest } from '@/app/api/client';

export interface WorkBridgeUser {
  id: number;
  name: string;
  email: string;
  role: 'personal' | 'company' | 'admin' | string;
  email_verified_at?: string | null;
  status?: 'pending_review' | 'under_review' | 'active' | 'blocked' | 'inactive' | 'unactive' | string;
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
  created_at?: string;
  updated_at?: string;
}

export interface LocationOption {
  id: number;
  name: string;
}

export interface PersonalProfile {
  id: number;
  user_id: number;
  name?: string | null;
  governorate_id?: number | null;
  city_id?: number | null;
  job_title: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  bio: string | null;
  rating_avg?: number | string | null;
  created_at?: string;
  updated_at?: string;
  governorate?: LocationOption | null;
  city?: LocationOption | null;
  skills: Array<{
    id: number;
    name: string;
  }>;
}

export interface PersonalProfileResponse {
  profile: PersonalProfile;
  rating_avg: number;
  reviews_count: number;
}

export interface ProfileReview {
  id: number;
  contract_id: number;
  reviewer_id: number;
  reviewed_user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: Pick<WorkBridgeUser, 'id' | 'name'> | null;
}

export interface UserReviewsResponse {
  rating_avg: number;
  reviews_count: number;
  reviews: ProfileReview[];
}

export interface PersonalDashboardResponse {
  message: string;
  role: 'personal';
  user: WorkBridgeUser;
  stats: {
    total_projects: number;
    active_projects: number;
    total_services: number;
    active_services: number;
    project_applications_sent: number;
    project_applications_received: number;
    job_applications_sent: number;
    service_requests_sent: number;
    service_requests_received: number;
    active_contracts: number;
    completed_contracts: number;
    pending_wallet_requests: number;
    wallet_balance: number | string;
    rating_avg: number | string;
  };
  recent_projects: Array<{
    id: number;
    title: string;
    budget: number | string;
    duration_days: number;
    status: string;
    category_name: string | null;
    created_at: string;
  }>;
  active_contracts: Array<{
    id: number;
    title: string | null;
    amount: number | string;
    status: string;
    client_name: string | null;
    freelancer_name: string | null;
    created_at: string;
  }>;
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    amount: number | string | null;
    created_at: string;
  }>;
}

export interface CompanyDashboardResponse {
  message: string;
  role: 'company';
  user: WorkBridgeUser;
}

export interface AdminDashboardResponse {
  message: string;
  role: 'admin';
  user: WorkBridgeUser;
  stats: {
    total_users: number;
    active_companies: number;
    open_disputes: number;
    platform_profit: number | string;
  };
  company_verification_requests: Array<{
    id: number;
    company_name: string | null;
    owner_name: string | null;
    owner_email: string | null;
    status: string;
    created_at: string;
  }>;
  content_needing_review: Array<{
    id: number;
    title: string;
    type: string;
    owner_name: string | null;
    status: string;
    created_at: string;
  }>;
  dispute_alerts: Array<{
    id: number;
    title: string;
    status: string;
    reporter_name: string | null;
    client_name: string | null;
    freelancer_name: string | null;
    amount: number | string | null;
    created_at: string;
  }>;
  charts: {
    users_growth: Array<{ month: string; count: number }>;
    monthly_revenue: Array<{ month: string; total: number | string }>;
  };
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
  status?: 'active' | 'paused' | 'closed' | string;
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

export interface PaginatedResponse<T> {
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
  reviews?: ProfileReview[];
}

export interface ReviewPayload {
  contract_id: number;
  rating: number;
  comment?: string | null;
}

export type JobApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface JobPost {
  id: number;
  company_id: number;
  title: string;
  description: string;
  location_type: 'remote' | 'on_site' | 'hybrid' | null;
  city_id: number | null;
  salary: number | string | null;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
  company?: {
    id: number;
    company_name: string;
    logo: string | null;
  } | null;
  city?: (LocationOption & {
    governorate?: LocationOption | null;
  }) | null;
}

export interface JobPayload {
  title: string;
  description: string;
  location_type?: 'remote' | 'on_site' | 'hybrid' | null;
  city_id?: number | null;
  salary?: number | null;
  status?: 'active' | 'paused' | 'closed';
}

export interface JobApplication {
  id: number;
  job_id: number;
  user_id: number;
  status: JobApplicationStatus;
  created_at: string;
  updated_at: string;
  job: JobPost | null;
  user?: (Pick<WorkBridgeUser, 'id' | 'name' | 'email'> & {
    profile?: PersonalProfile | null;
  }) | null;
}

export type WalletTransactionDirection = 'credit' | 'debit';
export type WalletTransactionStatus = 'completed' | string;

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  user_id: number | null;
  type: string;
  direction: WalletTransactionDirection;
  amount: number | string;
  balance_before: number | string;
  balance_after: number | string;
  status: WalletTransactionStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: number;
  user_id: number | null;
  type: string;
  balance: number | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  transactions: WalletTransaction[];
  user?: Pick<WorkBridgeUser, 'id' | 'name' | 'email'> | null;
}

export type WalletRequestType = 'deposit' | 'withdraw';
export type WalletRequestStatus = 'pending' | 'approved' | 'rejected';

export interface WalletRequest {
  id: number;
  user_id: number;
  type: WalletRequestType;
  amount: number | string;
  status: WalletRequestStatus;
  payment_note: string | null;
  deposit_receipt_path: string | null;
  deposit_receipt_url: string | null;
  withdrawal_details: string | null;
  admin_note: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: Pick<WorkBridgeUser, 'id' | 'name' | 'email' | 'role' | 'status'> | null;
  reviewer?: Pick<WorkBridgeUser, 'id' | 'name' | 'email'> | null;
}

export interface WalletOperationResponse {
  status: boolean;
  message: string;
  transaction: WalletTransaction;
}

export interface AdminEarningsResponse {
  status: boolean;
  balance: number | string;
  earnings: number | string;
}

export interface UserNotification {
  id: number;
  user_id: number;
  type: string | null;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: number;
  user_id: number;
  governorate_id: number | null;
  city_id: number | null;
  company_name: string;
  logo: string | null;
  website: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
  governorate?: LocationOption | null;
  city?: LocationOption | null;
  skills: Array<{
    id: number;
    name: string;
  }>;
}

export interface UpdateCompanyProfilePayload {
  company_name: string;
  website: string | null;
  location: string | null;
  governorate_id?: number | null;
  city_id?: number | null;
  description: string | null;
  phone: string | null;
  skills: string[];
  logo?: File | null;
}

export type ContactPermission = 'all' | 'verified' | 'none';

export interface UserSettings {
  privacy: {
    profile_visible: boolean;
    contact_permission: ContactPermission;
  };
  notifications: {
    message_notifications: boolean;
  };
}

export interface PasswordUpdatePayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AdminSettings {
  critical_dispute_notifications: boolean;
  company_verification_notifications: boolean;
}

export type ReportCategory = 'support' | 'complaint' | 'dispute' | 'payment' | 'technical';
export type ReportPriority = 'low' | 'normal' | 'high';
export type ReportStatus = 'pending' | 'accepted' | 'rejected' | string;
export type ReportTargetType = 'user' | 'project' | 'service' | 'contract' | 'general';

export interface ReportUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type ReportAttachment =
  | string
  | {
      type?: 'file' | 'reference' | string;
      name?: string | null;
      path?: string | null;
      url?: string | null;
      mime_type?: string | null;
      size?: number | null;
    };

export interface Report {
  id: number;
  reporter_id: number;
  target_type: ReportTargetType | string;
  target_id: number;
  contract_id: number | null;
  title: string | null;
  category: ReportCategory | string;
  priority: ReportPriority | string;
  description: string;
  attachments: ReportAttachment[] | null;
  status: ReportStatus;
  admin_decision: string | null;
  created_at: string;
  updated_at: string;
  reporter?: ReportUser | null;
  target_summary?: {
    id: number;
    type: string;
    title?: string | null;
    owner_name?: string | null;
    email?: string | null;
    status?: string | null;
    amount?: number | string | null;
  } | null;
  contract_summary?: {
    id: number;
    amount?: number | string | null;
    commission_amount?: number | string | null;
    freelancer_amount?: number | string | null;
    status?: string | null;
    client_name?: string | null;
    client_email?: string | null;
    freelancer_name?: string | null;
    freelancer_email?: string | null;
    subject_title?: string | null;
  } | null;
}

export type ProjectStatus = 'active' | 'paused' | 'closed' | string;

export interface ProjectOwner {
  id: number;
  name: string;
  role: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
}

export interface ProjectSkill {
  id: number;
  name: string;
}

export interface UserProject {
  id: number;
  user_id: number;
  category_id: number;
  governorate_id: number | null;
  city_id: number | null;
  title: string;
  description: string;
  budget: number | string;
  duration_days: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  user?: ProjectOwner | null;
  category?: ProjectCategory | null;
  governorate?: LocationOption | null;
  city?: (LocationOption & { governorate_id?: number | null }) | null;
  skills?: ProjectSkill[];
}

export interface ProjectApplication {
  id: number;
  user_project_id: number;
  user_id: number;
  price: number | string;
  duration_days: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  project?: Pick<UserProject, 'id' | 'title' | 'user_id'> | null;
  user?: Pick<WorkBridgeUser, 'id' | 'name' | 'email'> | null;
}

export interface ProjectApplicationPayload {
  price: number;
  duration_days: number;
  description: string;
}

export interface CreateReportPayload {
  target_type?: ReportTargetType;
  target_id?: number;
  contract_id?: number | null;
  title?: string | null;
  category?: ReportCategory;
  priority?: ReportPriority;
  description: string;
  attachments?: Array<string | File> | null;
  attachment_references?: string[] | null;
}

export interface ReportDecisionPayload {
  status: 'accepted' | 'rejected';
  admin_decision?: string | null;
  admin_action?: 'refund_client' | 'release_freelancer';
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

export function forgotPassword(payload: { email: string }) {
  return apiRequest<{ message: string }>('/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

export function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return apiRequest<{ message: string }>('/reset-password', {
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

export async function getMyServiceRequestsPage(page = 1) {
  const response = await apiRequest<{
    requests: PaginatedResponse<ServiceRequest>;
  }>(`/service-requests/my?page=${page}`);
  return response.requests;
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

export async function getConversationMessagesPage(conversationId: number, page = 1) {
  const response = await apiRequest<{
    messages: PaginatedResponse<ConversationMessage>;
  }>(`/conversations/${conversationId}/messages?page=${page}`);
  return response.messages;
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

export async function getCompanyContractsPage(page = 1) {
  const response = await apiRequest<{ contracts: PaginatedResponse<Contract> }>(
    `/company/contracts?page=${page}`,
  );
  return response.contracts;
}

export async function getContract(id: number) {
  const response = await apiRequest<{ contract: Contract }>(`/contracts/${id}`);
  return response.contract;
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

export async function getJobs() {
  const response = await apiRequest<{
    jobs: JobPost[] | PaginatedResponse<JobPost>;
  }>('/jobs');
  return unwrapList(response.jobs);
}

export async function getJob(id: string | number) {
  const response = await apiRequest<{ job: JobPost }>(`/jobs/${id}`);
  return response.job;
}

export async function getMyJobApplications() {
  const response = await apiRequest<{ applications: JobApplication[] }>(
    '/my-job-applications',
  );
  return response.applications;
}

export async function applyToJob(jobId: string | number) {
  const response = await apiRequest<{
    message: string;
    application: JobApplication;
  }>(`/jobs/${jobId}/apply`, { method: 'POST' });
  return response.application;
}

export async function createJob(payload: JobPayload) {
  const response = await apiRequest<{ message: string; job: JobPost }>('/jobs', {
    method: 'POST',
    body: payload,
  });
  return response.job;
}

export async function updateJob(id: string | number, payload: Partial<JobPayload>) {
  const response = await apiRequest<{ message: string; job: JobPost }>(`/jobs/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.job;
}

export function deleteJob(id: string | number) {
  return apiRequest(`/jobs/${id}`, { method: 'DELETE' });
}

export async function pauseJob(id: string | number) {
  const response = await apiRequest<{ message: string; job: JobPost }>(`/jobs/${id}/pause`, {
    method: 'POST',
  });
  return response.job;
}

export async function activateJob(id: string | number) {
  const response = await apiRequest<{ message: string; job: JobPost }>(`/jobs/${id}/activate`, {
    method: 'POST',
  });
  return response.job;
}

export async function getCompanyJobs() {
  const response = await apiRequest<{
    jobs: JobPost[] | PaginatedResponse<JobPost>;
  }>('/company/jobs');
  return unwrapList(response.jobs);
}

export async function getCompanyJobsPage(page = 1) {
  const response = await apiRequest<{
    jobs: PaginatedResponse<JobPost>;
  }>(`/company/jobs?page=${page}`);
  return response.jobs;
}

export async function getJobApplications(jobId: string | number) {
  const response = await apiRequest<{ applications: JobApplication[] }>(
    `/jobs/${jobId}/applications`,
  );
  return response.applications;
}

export async function updateJobApplicationStatus(
  applicationId: string | number,
  status: JobApplicationStatus,
) {
  const response = await apiRequest<{ application: JobApplication }>(
    `/job-applications/${applicationId}/status`,
    { method: 'PATCH', body: { status } },
  );
  return response.application;
}

export async function getProjects(params?: {
  page?: number;
  search?: string;
  status?: 'active' | 'paused' | 'closed';
  category_id?: number;
  governorate_id?: number;
  city_id?: number;
  min_price?: number;
  max_price?: number;
  type?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const response = await apiRequest<{ projects: PaginatedResponse<UserProject> }>(
    `/projects${query.toString() ? `?${query.toString()}` : ''}`,
  );
  return response.projects;
}

export async function getProject(id: string | number) {
  const response = await apiRequest<{ project: UserProject }>(`/projects/${id}`);
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

export async function getMyProjectApplications(page = 1) {
  const response = await apiRequest<{ applications: PaginatedResponse<ProjectApplication> }>(
    `/applications/my?page=${page}`,
  );
  return response.applications;
}

export async function getReceivedProjectApplications(page = 1) {
  const response = await apiRequest<{ applications: PaginatedResponse<ProjectApplication> }>(
    `/applications/received?page=${page}`,
  );
  return response.applications;
}

export async function acceptProjectApplication(id: string | number) {
  const response = await apiRequest<{
    message: string;
    application: ProjectApplication;
    contract?: Contract;
  }>(`/applications/${id}/accept`, { method: 'POST' });
  return response.application;
}

export async function rejectProjectApplication(id: string | number) {
  const response = await apiRequest<{
    message: string;
    application: ProjectApplication;
  }>(`/applications/${id}/reject`, { method: 'POST' });
  return response.application;
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

export function getUserReviews(userId: string | number) {
  return apiRequest<UserReviewsResponse>(`/users/${userId}/reviews`);
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

export async function getUserSettings() {
  const response = await apiRequest<{ settings: UserSettings }>('/settings');
  return response.settings;
}

export async function updatePrivacySettings(payload: UserSettings['privacy']) {
  const response = await apiRequest<{ message: string; settings: UserSettings }>(
    '/settings/privacy',
    { method: 'PUT', body: payload },
  );
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

export async function getMyReports(page = 1) {
  const response = await apiRequest<{ reports: PaginatedResponse<Report> }>(
    `/reports/my?page=${page}`,
  );
  return response.reports;
}

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

export async function getLatestReport() {
  const response = await apiRequest<{ report: Report | null }>('/reports/latest');
  return response.report;
}

export async function getAllReports() {
  const response = await apiRequest<{ reports: Report[] }>('/reports');
  return response.reports;
}

export async function updateReportDecision(id: string | number, payload: ReportDecisionPayload) {
  const response = await apiRequest<{ message: string; report: Report }>(
    `/reports/${id}/decision`,
    { method: 'PUT', body: payload },
  );
  return response.report;
}

export function getDashboard<T>(role: WorkBridgeUser['role']) {
  const endpoint = role === 'personal' ? 'personal' : role;
  return apiRequest<T>(`/dashboard/${endpoint}`);
}

export function getPersonalDashboard() {
  return apiRequest<PersonalDashboardResponse>('/dashboard/personal');
}

export function getCompanyDashboard() {
  return apiRequest<CompanyDashboardResponse>('/dashboard/company');
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboardResponse>('/dashboard/admin');
}

export async function getMyWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/wallet');
  return response.wallet;
}

export async function getMyWalletRequests(page = 1) {
  const response = await apiRequest<{ status: boolean; requests: PaginatedResponse<WalletRequest> }>(
    `/wallet/requests?page=${page}`,
  );
  return response.requests;
}

export async function getAdminWallets() {
  const response = await apiRequest<{ status: boolean; wallets: Wallet[] }>('/admin/wallets');
  return response.wallets;
}

export async function getAdminTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/transactions');
  return response.wallet;
}

export async function getEscrowTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/escrow/transactions');
  return response.wallet;
}

export async function getAdminEarnings() {
  return apiRequest<AdminEarningsResponse>('/admin/earnings');
}

export async function requestWalletDeposit(
  amount: number,
  payment_note?: string | null,
  deposit_receipt?: File | null,
  deposit_proof?: string | null,
) {
  const body = new FormData();
  body.append('amount', String(amount));
  if (payment_note) body.append('payment_note', payment_note);
  if (deposit_proof) body.append('deposit_proof', deposit_proof);
  if (deposit_receipt) body.append('deposit_receipt', deposit_receipt);

  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    '/wallet/deposit-requests',
    { method: 'POST', body },
  );
  return response.request;
}

export async function requestWalletWithdraw(amount: number, withdrawal_details: string) {
  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    '/wallet/withdraw-requests',
    { method: 'POST', body: { amount, withdrawal_details } },
  );
  return response.request;
}

export async function getAdminWalletRequests(params?: {
  page?: number;
  type?: WalletRequestType | '';
  status?: WalletRequestStatus | '';
  search?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await apiRequest<{ status: boolean; requests: PaginatedResponse<WalletRequest> }>(
    `/admin/wallet-requests${query.toString() ? `?${query.toString()}` : ''}`,
  );
  return response.requests;
}

export async function approveWalletRequest(id: string | number, admin_note?: string | null) {
  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    `/admin/wallet-requests/${id}/approve`,
    { method: 'POST', body: { admin_note } },
  );
  return response.request;
}

export async function rejectWalletRequest(id: string | number, admin_note?: string | null) {
  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    `/admin/wallet-requests/${id}/reject`,
    { method: 'POST', body: { admin_note } },
  );
  return response.request;
}

export function transferWalletToAdmin(amount: number) {
  return apiRequest<WalletOperationResponse>('/wallet/transfer-to-admin', {
    method: 'POST',
    body: { amount },
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

export async function markNotificationAsRead(id: string | number) {
  const response = await apiRequest<{
    message: string;
    notification: UserNotification;
  }>(`/notifications/${id}/read`, { method: 'POST' });
  return response.notification;
}

export function markAllNotificationsAsRead() {
  return apiRequest<{ message: string; updated_count: number }>(
    '/notifications/read-all',
    { method: 'POST' },
  );
}

export function deleteNotification(id: string | number) {
  return apiRequest<{ message: string }>(`/notifications/${id}`, {
    method: 'DELETE',
  });
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

export function requestAdminCompanyDocuments(
  id: string | number,
  payload: { title: string; message: string },
) {
  return apiRequest(`/admin/companies/${id}/request-document`, {
    method: 'POST',
    body: {
      document_name: payload.title,
      reason: payload.message,
    },
  });
}

export type AdminContentType = 'projects' | 'services' | 'jobs';
export type AdminContentStatus = 'active' | 'paused' | 'closed';

export interface AdminContentQuery {
  page?: number;
  search?: string;
  status?: AdminContentStatus;
}

function buildAdminContentQuery(params?: AdminContentQuery) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getAdminContentProjects(params?: AdminContentQuery) {
  const query = buildAdminContentQuery(params);
  const response = await apiRequest<{ projects: PaginatedResponse<UserProject> }>(
    `/admin/content/projects${query ? `?${query}` : ''}`,
  );
  return response.projects;
}

export async function getAdminContentServices(params?: AdminContentQuery) {
  const query = buildAdminContentQuery(params);
  const response = await apiRequest<{ services: PaginatedResponse<Service> }>(
    `/admin/content/services${query ? `?${query}` : ''}`,
  );
  return response.services;
}

export async function getAdminContentJobs(params?: AdminContentQuery) {
  const query = buildAdminContentQuery(params);
  const response = await apiRequest<{ jobs: PaginatedResponse<JobPost> }>(
    `/admin/content/jobs${query ? `?${query}` : ''}`,
  );
  return response.jobs;
}

export function updateAdminProjectStatus(id: string | number, status: AdminContentStatus) {
  return apiRequest(`/admin/content/projects/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function updateAdminServiceStatus(id: string | number, status: AdminContentStatus) {
  return apiRequest(`/admin/content/services/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function updateAdminJobStatus(id: string | number, status: AdminContentStatus) {
  return apiRequest(`/admin/content/jobs/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function deleteAdminContentProject(id: string | number) {
  return apiRequest(`/admin/content/projects/${id}`, { method: 'DELETE' });
}

export function deleteAdminContentService(id: string | number) {
  return apiRequest(`/admin/content/services/${id}`, { method: 'DELETE' });
}

export function deleteAdminContentJob(id: string | number) {
  return apiRequest(`/admin/content/jobs/${id}`, { method: 'DELETE' });
}

export async function getAdminContentCategories() {
  const response = await apiRequest<{ categories: Category[] }>('/admin/content/categories');
  return response.categories;
}

export async function createAdminContentCategory(name: string) {
  const response = await apiRequest<{ message: string; category: Category }>(
    '/admin/content/categories',
    { method: 'POST', body: { name } },
  );
  return response.category;
}

export async function updateAdminContentCategory(id: string | number, name: string) {
  const response = await apiRequest<{ message: string; category: Category }>(
    `/admin/content/categories/${id}`,
    { method: 'PUT', body: { name } },
  );
  return response.category;
}

export function deleteAdminContentCategory(id: string | number) {
  return apiRequest<{ message: string }>(`/admin/content/categories/${id}`, {
    method: 'DELETE',
  });
}
