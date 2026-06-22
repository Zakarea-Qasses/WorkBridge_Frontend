# Frontend API Requirements

## Project Overview

- Stack: React app built with Vite.
- Language: TypeScript with `.tsx` pages and components.
- Routing: `react-router` v7 via `createBrowserRouter`.
- UI: local component layer in `src/app/components/ui`, Radix primitives, Tailwind CSS, lucide-react icons, Recharts.
- State management: no Redux/Zustand/query client. State is local React state plus `localStorage` wrappers under `src/app/storage`.
- API status: no real backend API calls currently. No `axios`, no `fetch`, no API client, no interceptors.
- Main entry: `src/main.tsx`.
- App shell: `src/app/App.tsx`.
- Router: `src/app/routes.ts`.
- Route config files: `src/app/route-config/authRoutes.ts`, `userRoutes.ts`, `companyRoutes.ts`, `adminRoutes.ts`.
- Pages: `src/app/pages/auth`, `src/app/pages/public`, `src/app/pages/user`, `src/app/pages/company`, `src/app/pages/admin`.
- Layout: `src/app/components/layout/DashboardLayout.tsx`.
- Shared state/provider: `src/app/providers/LanguageProvider.tsx` stores language in `localStorage`.

## How To Run Frontend

- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Vite entry HTML: `index.html`
- Vite config: `vite.config.ts`

## Routes and Pages

| Page | Route | File | Data shown | Mock data? | Needs API? | Operations |
|---|---|---|---|---|---|---|
| Landing | `/` | `src/app/pages/public/Landing.tsx` | public marketing content | static | low | list |
| Help Center | `/help` | `src/app/pages/public/HelpCenter.tsx` | static help content | static | optional | list/search |
| Privacy | `/privacy` | `src/app/pages/public/Privacy.tsx` | policy text | static | no | list |
| Terms | `/terms` | `src/app/pages/public/Terms.tsx` | terms text | static | no | list |
| Login | `/login` | `src/app/pages/auth/Login.tsx` | login form | localStorage demo account type | yes | create |
| Register | `/register` | `src/app/pages/auth/Register.tsx` | registration form | localStorage demo account | yes | create |
| Email Verification | `/verify-email` | `src/app/pages/auth/EmailVerification.tsx` | OTP entry and timer | reads localStorage email | yes | create/update |
| Forgot Password | `/forgot-password` | `src/app/pages/auth/ForgotPassword.tsx` | reset email form | static submit | yes | create |
| User Dashboard | `/dashboard` | `src/app/pages/user/Dashboard.tsx` | stats/recent projects | inline static arrays | yes | list |
| Projects | `/projects` | `src/app/pages/user/Projects.tsx` | project list, filters, report action | `projectsStorage`, `reportsStorage` | yes | list/search/create report |
| Create Project | `/projects/create` | `src/app/pages/user/CreateProject.tsx` | project creation form | `createProject()` localStorage | yes | create |
| Project Details | `/projects/:id` | `src/app/pages/user/ProjectDetails.tsx` | project details/proposal form | `getProjects()` | yes | details/create |
| Services | `/services` | `src/app/pages/user/Services.tsx` | service list, filters, report action | `servicesStorage`, `reportsStorage` | yes | list/search/create report |
| Create Service | `/services/create` | `src/app/pages/user/CreateService.tsx` | service publish form | `createService()` localStorage | yes | create |
| My Services | `/services/my` | `src/app/pages/user/MyServices.tsx` | own services with status/delete | `servicesStorage` | yes | list/update/delete/archive |
| Service Requests | `/services/requests` | `src/app/pages/user/ServiceRequests.tsx` | incoming service requests | `serviceRequestStorage`, `contractsStorage` | yes | list/update/create |
| Request Service | `/services/:id/request` | `src/app/pages/user/RequestService.tsx` | selected service and request form | `servicesStorage`, `serviceRequestStorage` | yes | details/create |
| Contracts | `/contracts` | `src/app/pages/user/Contracts.tsx` | user contracts and status actions | `contractsStorage` | yes | list/update |
| Applications | `/applications` | `src/app/pages/user/Applications.tsx` | applied jobs/service requests | `jobsData`, applied job IDs, service requests | yes | list/delete |
| Jobs | `/jobs` | `src/app/pages/user/Jobs.tsx` | job list, filters, apply/report | `jobsData`, `jobApplicationStorage`, applicants storage | yes | list/search/create |
| Applied Jobs | `/applied-jobs` | `src/app/pages/user/AppliedJobs.tsx` | applied job list | `jobsData`, `jobApplicationStorage` | yes | list |
| Wallet | `/wallet` | `src/app/pages/user/Wallet.tsx` | balance/transactions | `walletStorage` | yes | details/list |
| Top Up Wallet | `/wallet/top-up` | `src/app/pages/user/TopUpWallet.tsx` | top-up form | `submitWalletTopUp()` | yes | create |
| Withdraw Wallet | `/wallet/withdraw` | `src/app/pages/user/WithdrawWallet.tsx` | withdrawal form | `submitWalletWithdrawal()` | yes | create |
| Messages | `/messages` | `src/app/pages/user/Messages.tsx` | conversations/messages/reports | `messagesStorage` | yes | list/search/create/update |
| Notifications | `/notifications` | `src/app/pages/user/Notifications.tsx` | generated notifications | inline static | yes | list/update |
| Profile | `/profile/:id` | `src/app/pages/user/Profile.tsx` | user profile/reviews/editing | localStorage profile, reviews storage | yes | details/update |
| Public Profile | `/freelancers/:id` | `src/app/pages/public/PublicProfile.tsx` | freelancer profile/reviews | inline static plus reviews storage | yes | details |
| Settings | `/settings` | `src/app/pages/user/Settings.tsx` | profile/account/privacy settings | localStorage settings | yes | update/delete |
| Support Center | `/support`, `/complaints` | `src/app/pages/user/SupportCenter.tsx` | tickets and ticket form | `supportStorage` | yes | list/create/upload |
| Company Dashboard | `/company-dashboard` | `src/app/pages/company/CompanyDashboard.tsx` | company stats/jobs/activity/profile | `platformData` | yes | list/details |
| Company Profile | `/company/profile` | `src/app/pages/company/CompanyProfile.tsx` | company profile and hiring focus | `platformData` local state | yes | details/update |
| Company Jobs | `/company/jobs` | `src/app/pages/company/CompanyJobs.tsx` | company job posts | `platformData` local state | yes | list/create/update/archive |
| Company Services | `/company/services` | `src/app/pages/company/CompanyServices.tsx` | service marketplace and quick request | `servicesStorage`, `serviceRequestStorage` | yes | list/search/create |
| Company Contracts | `/company/contracts` | `src/app/pages/company/CompanyContracts.tsx` | company contracts | `contractsStorage` | yes | list/update |
| Company Applicants | `/company/applicants` | `src/app/pages/company/CompanyApplicants.tsx` | applicants and decisions | `companyApplicantsStorage` | yes | list/update |
| Company Wallet | `/company/wallet` | `src/app/pages/company/CompanyWallet.tsx` | company wallet | `walletStorage` | yes | details/list |
| Company Top Up | `/company/wallet/top-up` | `src/app/pages/company/CompanyTopUpWallet.tsx` | company top-up form | `walletStorage` | yes | create |
| Company Withdraw | `/company/wallet/withdraw` | `src/app/pages/company/CompanyWithdrawWallet.tsx` | company withdrawal form | `walletStorage` | yes | create |
| Company Messages | `/company/messages` | `src/app/pages/company/CompanyMessages.tsx` | company message wrapper | `MessagesPage` | yes | list/search/create/update |
| Company Notifications | `/company/notifications` | `src/app/pages/company/CompanyNotifications.tsx` | company notification wrapper | generated notifications | yes | list/update |
| Company Settings | `/company/settings` | `src/app/pages/company/CompanySettings.tsx` | company settings wrapper | `SettingsPage` | yes | update/delete |
| Admin Dashboard | `/admin` | `src/app/pages/admin/AdminDashboard.tsx` | admin stats, users, disputes, projects | `platformData` | yes | list/details |
| Admin Users | `/admin/users` | `src/app/pages/admin/AdminUsers.tsx` | users table/cards | `platformData.adminUsers` | yes | list/search/update/archive |
| Admin Verification | `/admin/verification` | `src/app/pages/admin/AdminVerification.tsx` | company verification queue | `platformData.companyVerificationQueue` local state | yes | list/update/create |
| Admin Disputes | `/admin/disputes` | `src/app/pages/admin/AdminDisputes.tsx` | dispute cases and decision form | `adminWorkflowStorage` | yes | list/update/create |
| Admin Finance | `/admin/finance` | `src/app/pages/admin/AdminFinance.tsx` | finance summary | `platformData.financeSummary` | yes | list |
| Admin Projects | `/admin/projects` | `src/app/pages/admin/AdminProjects.tsx` | content review queue | `adminWorkflowStorage` | yes | list/details/update/delete |
| Admin Reports | `/admin/reports` | `src/app/pages/admin/AdminReports.tsx` | unified chat/content reports | `reportsStorage`, `messagesStorage` | yes | list/update |
| Admin Site Wallet | `/admin/site-wallet` | `src/app/pages/admin/AdminSiteWallet.tsx` | site wallet, escrows, release/refund | `walletStorage` | yes | list/details/update |
| Admin Messages | `/admin/messages` | `src/app/pages/admin/AdminMessages.tsx` | admin message monitor wrapper | `MessagesPage` | yes | list/search |
| Admin Notifications | `/admin/notifications` | `src/app/pages/admin/AdminNotifications.tsx` | admin notifications wrapper | generated notifications | yes | list/update |
| Admin Settings | `/admin/settings` | `src/app/pages/admin/AdminSettings.tsx` | admin alert settings | localStorage | yes | update |
| Not Found/Error | `*`, route errors | public error pages | error/static text | static | no | details |

## Forms and Required Fields

| Form | Page | Fields and frontend names | Required | Current validation | Expected endpoint | Current submit |
|---|---|---|---|---|---|---|
| Login | Login | `email:string`, `password:string`, `remember:boolean` | email/password | non-empty, password length >= 8 | `POST /auth/login` | mock navigate by localStorage account type |
| Register | Register | `fullName:string`, `email:string`, `password:string`, `confirmPassword:string`, `accountType:string`, `acceptedTerms:boolean` | all except accountType default | non-empty, password length >= 8, match, terms accepted | `POST /auth/register` | saves demo account to localStorage |
| Email verification | Email Verification | `code:string[6]`, email from registered account | code should be required | numeric normalization, 6 inputs, 10 minute UI timer | `POST /auth/verify-email`, `POST /auth/resend-verification` | no verify call; resend resets local timer |
| Forgot password | Forgot Password | `email:string` | expected email required | none currently | `POST /auth/forgot-password` | form has no handler |
| Create project | Create Project | `title:string`, `description:string`, `budget:number/string`, `duration:string`, `category:string`, `skills:array`, `governorateId:number`, `cityId:number` | title/description/budget/duration | budget digits only; duration > 0; category defaults to General | `POST /projects` | localStorage create |
| Project proposal | Project Details | `bid:number`, `duration:string`, `proposal:string` | all | non-empty, duration not 0 | `POST /projects/{id}/proposals` | feedback only |
| Create service | Create Service | `title:string`, `category:string`, `price:number/string`, `delivery:string`, `description:string` | title/category/price/delivery | price digits only; delivery formatted as days | `POST /services` | localStorage create |
| Request service | Request Service | `requestTitle:string`, `details:string`, `references:string`, `deadline:string` plus service/user IDs | title/details/deadline | non-empty, deadline > 0 | `POST /services/{id}/requests` | localStorage create |
| Service request decision | Service Requests | request `status:string`; may create contract | action only | none beyond selected action | `PATCH /service-requests/{id}`, optionally `POST /contracts` | localStorage update/create |
| Top up wallet | TopUpWallet/CompanyTopUpWallet | `amount:number`, `paymentMethod:string`, `reference:string` | amount/method | amount > 0, no zero | `POST /wallet/top-ups` | localStorage transaction |
| Withdraw wallet | WithdrawWallet/CompanyWithdrawWallet | `amount:number`, `withdrawMethod:string`, `accountName:string` | amount/method | amount > 0, minimum 500, <= available balance | `POST /wallet/withdrawals` | localStorage transaction |
| Support ticket | Support Center | `subject:string`, `description:string`, `attachments:file[]` | subject/description | non-empty; accepts image/pdf/doc/txt/zip/rar | `POST /support/tickets` with multipart upload | localStorage metadata only |
| Review | PostCompletionReviewsSection | `criteria:array<{label,value:number}>`, `comment:string`, `contractId:number` | comment, selected contract | comment non-empty; criteria defaults to 5 | `POST /contracts/{id}/reviews` | localStorage update |
| Profile edit | Profile | `name:string`, `title:string`, `email:string`, `phone:string`, `bio:string`, `skills:array`, `governorateId:number`, `cityId:number` | name/title/email | non-empty required fields | `PATCH /profile` | localStorage update |
| Settings profile | SettingsPage | `fullName:string`, `title:string`, `bio:string`, `location:string`, `phone:string` | none currently | none | `PATCH /settings/profile` | localStorage update |
| Settings skills | SettingsPage | `skills:string/array` | none currently | none | `PATCH /settings/skills` | localStorage update |
| Change password | SettingsPage | `currentPassword:string`, `newPassword:string`, `confirmPassword:string` | all | non-empty, match, new password length >= 6 | `PATCH /auth/password` | localStorage update |
| Delete account data | SettingsPage | current user/role | action | none | `DELETE /account` or `DELETE /settings/local-data` | removes local keys |
| Message send | MessagesPage | `conversationId:number`, `text:string` | text | trims and ignores empty | `POST /conversations/{id}/messages` | localStorage append |
| Message/report conversation | MessagesPage | `conversationId:number`, `messageId:number`, `reason:string` | target/reason | prevents admin report action; duplicate unresolved reports ignored in storage | `POST /reports` | localStorage report |
| Company profile edit | CompanyProfile | `name:string`, `industry:string`, `governorateId:number`, `cityId:number`, `website:string`, `about:string`, `hiringFocus:array` | none currently | hiring focus non-empty and unique | `PATCH /company/profile` | component state only |
| Company job create/update | CompanyJobs | `title:string`, `department:string`, `governorateId:number`, `cityId:number` | title/department/location | non-empty required fields | `POST /company/jobs`, `PATCH /company/jobs/{id}` | component state only |
| Applicant decision | CompanyApplicants | `applicantId:number`, `status:string`, `stage:string` | applicant/action | none | `PATCH /company/applicants/{id}` | localStorage update |
| Verification document request | AdminVerification | `companyId:number`, `documentTitle:string`, `requestReason:string` | all | non-empty | `POST /admin/verifications/{id}/document-requests` | component state only |
| Verification approve/reject | AdminVerification | `companyId:number`, `status:string` | company/action | none | `PATCH /admin/verifications/{id}` | component state only |
| Dispute decision | AdminDisputes | `disputeId:number`, `decisionTitle:string`, `decisionSummary:string` | all | non-empty | `POST /admin/disputes/{id}/decision` | localStorage update |
| Admin content actions | AdminProjects | `itemId:number`, `actionLabel:string` or delete | item/action | none | `PATCH /admin/content/{id}`, `DELETE /admin/content/{id}` | localStorage update/delete |
| Admin report status | AdminReports | `reportId:string`, `status:string` | report/action | stage action only | `PATCH /admin/reports/{id}` | localStorage update |
| Site escrow actions | AdminSiteWallet | `escrowId:number`, action release/refund | escrow/action | storage checks status/release due | `POST /admin/escrows/{id}/release`, `POST /admin/escrows/{id}/refund` | localStorage wallet update |
| Admin settings | AdminSettings | `criticalAlerts:boolean`, `verificationAlerts:boolean` | no | none | `PATCH /admin/settings` | localStorage update |

## Current API Calls

- API files/services/hooks: none found.
- `axios`: not installed and not used.
- `fetch`: not used in `src`.
- Base URL: none.
- Token handling: none.
- Interceptors: none.
- Error handling: only local form/status messages, no centralized API error layer.
- Loading state: `Suspense` fallback only via `AppLoader`; no API loading state.
- Protected routes: none. All routes are public in the router. Dashboard links are shown based on URL and layout only, not auth guards.

## Mock Data Usage

- `src/app/data/platformData.ts`: admin stats/users/verification queue/projects/disputes/finance/company jobs/applicants/company activity/company profile/status label helpers.
- `src/app/data/jobsData.ts`: public job listings.
- `src/app/data/locationsData.ts`: governorates/cities used by profile/project/company job forms.
- `src/app/storage/projectsStorage.ts`: projects list and create project.
- `src/app/storage/servicesStorage.ts`: services list/create/update/delete.
- `src/app/storage/serviceRequestStorage.ts`: service requests create/status update.
- `src/app/storage/contractsStorage.ts`: contract list/create/status update.
- `src/app/storage/walletStorage.ts`: user/company/provider/site wallets, transactions, escrows, top-up, withdrawal, release, refund.
- `src/app/storage/messagesStorage.ts`: conversations, messages, message reports.
- `src/app/storage/supportStorage.ts`: support tickets and attachment metadata.
- `src/app/storage/reportsStorage.ts`: content reports and unified admin report list.
- `src/app/storage/reviewsStorage.ts`: completed contracts and profile reviews.
- `src/app/storage/adminWorkflowStorage.ts`: admin content/dispute workflow records.
- `src/app/storage/companyApplicantsStorage.ts`: company applicant decisions.
- `src/app/storage/jobApplicationStorage.ts`: applied job IDs.
- Inline page data also exists in `Dashboard.tsx`, `Notifications.tsx`, public profiles, and some generated UI summaries.

To replace mocks later, keep the page APIs stable and swap storage functions with async service calls. The easiest migration path is to create domain services matching the storage function names, then update pages to handle `loading`, `error`, and refetch states.

## Authentication In Frontend

- Login page exists: `src/app/pages/auth/Login.tsx`.
- Register page exists: `src/app/pages/auth/Register.tsx`.
- Email verification page exists: `src/app/pages/auth/EmailVerification.tsx`.
- Forgot password page exists but has no real submit handler.
- Token storage: none.
- Token key: none.
- Cookies/session handling: none.
- Logout: UI links only navigate to `/`; no token/session clearing except unrelated theme removal.
- Protected routes: none.
- Role handling: mock only. `Login.tsx` reads `workbridge-registered-account.accountType` from localStorage and redirects to user/company/admin dashboards. `DashboardLayout` receives `userType` prop for menus.
- Permissions: none enforced.

## Required Environment Variables

Current files:

- `.env`: missing.
- `.env.example`: missing.
- `VITE_API_BASE_URL`: missing.
- `API_URL`: missing.
- `BACKEND_URL`: missing.

Recommended later, without adding now:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Optional if using cookie/Sanctum style auth later:

```env
VITE_BACKEND_URL=http://localhost:8000
```

## API Requirements By Page

- Auth pages need register/login/logout/current user/email verification/resend verification/forgot password/change password.
- Marketplace pages need projects, services, jobs, filters/search, details, applications/proposals, reports.
- User workspace needs profile, settings, notifications, messages, contracts, service requests, wallet, support tickets, reviews.
- Company workspace needs company profile, job management, applicants, contracts, wallet, messages, notifications, services browsing/requesting.
- Admin workspace needs users, company verification, disputes, content moderation, reports, finance summaries, site wallet/escrows, admin settings, admin messages.
- Public pages needing API are mainly `PublicProfile` and optionally help content/search. Static legal pages can stay frontend-only unless CMS-driven.

## Expected Response Shapes

```ts
type PaginatedResponse<T> = {
  data: T[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number };
};

type Project = {
  id: number;
  title: string;
  description: string;
  budget: string;
  budgetValue: number;
  category: string;
  duration: string;
  proposals: number;
  postedTime: string;
  client: string;
  skills: string[];
  featured: boolean;
};

type Service = {
  id: number;
  title: string;
  category: string;
  price: string;
  delivery: string;
  rating: number;
  provider: string;
  providerId: number;
  description: string;
  status: string;
  orders: number;
};

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  department?: string;
  description?: string;
  requirements?: string[];
  applicants?: number;
  verified?: boolean;
  status?: string;
  postedTime?: string;
  publishedAt?: string;
};

type ServiceRequest = {
  id: number;
  serviceId: number;
  serviceTitle: string;
  provider: string;
  providerId: number;
  client: string;
  clientId: number;
  price: string;
  requestTitle: string;
  details: string;
  references: string;
  deadline: string;
  status: string;
  createdAt: string;
};

type Contract = {
  id: number;
  postId: number;
  postTitle: string;
  postType: 'Project' | 'Service' | 'Job';
  clientId: number;
  clientName: string;
  freelancerId: number;
  freelancerName: string;
  companyId?: number;
  companyName?: string;
  amount: number;
  commission: number;
  finalAmount: number;
  status: string;
  createdAt: string;
};

type Wallet = {
  balance: { total: number; available: number; reserved: number };
  transactions: Array<{ id: number; type: 'credit' | 'debit'; description: string; amount: number; status: string; date: string; time: string; escrowId?: number }>;
  escrows?: Array<{ id: number; projectTitle: string; clientName: string; providerName: string; amount: number; reservedAt: string; releaseOn: string; status: string; resolvedAt?: string; resolution?: string }>;
};

type Conversation = {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  project: string;
  profilePath: string;
};

type Message = {
  id: number;
  conversationId: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
  reported?: boolean;
};

type SupportTicket = {
  id: number;
  category: 'Support' | 'Complaint' | 'Dispute';
  status: 'New' | 'Under Review' | 'Closed';
  subject: string;
  description: string;
  createdAt: string;
  attachments: Array<{ name: string; type: string; size: number; url?: string }>;
};

type Report = {
  id: string | number;
  source: 'chat' | 'content';
  targetType: string;
  targetLabel: string;
  reporter: string;
  status: string;
  description: string;
  createdAt: string;
};

type UserProfile = {
  id: number;
  name: string;
  title: string;
  rating: number;
  totalProjects: number;
  completionRate: number;
  email: string;
  phone: string;
  joinDate: string;
  verified: boolean;
  bio: string;
  skills: string[];
  governorateId?: number;
  cityId?: number;
};
```

## Files That Need Integration Later

- `src/app/routes.ts` and `src/app/route-config/*`: add protected route behavior after auth exists.
- `src/app/pages/auth/Login.tsx`, `Register.tsx`, `EmailVerification.tsx`, `ForgotPassword.tsx`.
- All page files under `src/app/pages/user`, especially projects/services/jobs/contracts/wallet/messages/profile/settings/support.
- All page files under `src/app/pages/company`, especially profile/jobs/applicants/contracts/wallet/messages/settings.
- All page files under `src/app/pages/admin`, especially users/verification/disputes/projects/reports/site wallet/settings.
- `src/app/components/shared/PostCompletionReviewsSection.tsx`.
- `src/app/components/layout/DashboardLayout.tsx` for real current user, logout, notification counts, role menus.
- `src/app/storage/*`: replace or wrap with real API services.
- `src/app/data/*`: replace seed lists with API-backed dictionaries/lookups where needed.
- New files needed later: API client, auth store/context, route guards, typed endpoint services, error/loading helpers.

## Frontend Readiness For Backend Integration

- Positive: routes and domain boundaries are clear; storage files already group frontend behavior by domain.
- Positive: form field names are mostly explicit and easy to map to backend DTOs.
- Positive: most user/company/admin flows already exist visually.
- Needs work: async loading/error states are missing across pages.
- Needs work: no auth guard, no token/session model, no current user endpoint, no role/permission enforcement.
- Needs work: mock status labels are mixed between English and mojibake Arabic strings; backend integration should standardize enum values.
- Needs work: file uploads currently store metadata only, not actual uploaded files.
- Needs work: many actions update component state only, so state is lost on refresh unless moved into storage/API.

## Missing Or Unclear Frontend Parts

- No API base URL or env example.
- No backend contract for status enums.
- No real auth/session/token behavior.
- No protected route design.
- No centralized API error display.
- No pagination handling in lists.
- No server-side search/filter contract.
- No real file upload progress or attachment URL model.
- No current-user/current-company source; many IDs/names are hardcoded as user `1`, provider `1`, company `1`, "Ahmad Mohammad", or "Work Bridge Labs".
- No real notification persistence/read state API.
- No real permissions for admin actions.
