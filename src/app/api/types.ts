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
export type ReportTargetType = 'user' | 'project' | 'service' | 'job' | 'contract' | 'general';

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

export type AdminContentType = 'projects' | 'services' | 'jobs';
export type AdminContentStatus = 'active' | 'paused' | 'closed';

export interface AdminContentQuery {
  page?: number;
  search?: string;
  status?: AdminContentStatus;
}
