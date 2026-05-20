import { lazyPage } from '@/app/route-config/lazyPage';

const CompanyDashboard = lazyPage(() => import('@/app/pages/company/CompanyDashboard'));
const CompanyProfile = lazyPage(() => import('@/app/pages/company/CompanyProfile'));
const CompanyJobs = lazyPage(() => import('@/app/pages/company/CompanyJobs'));
const CompanyServices = lazyPage(() => import('@/app/pages/company/CompanyServices'));
const CompanyContracts = lazyPage(() => import('@/app/pages/company/CompanyContracts'));
const CompanyApplicants = lazyPage(() => import('@/app/pages/company/CompanyApplicants'));
const CompanyWallet = lazyPage(() => import('@/app/pages/company/CompanyWallet'));
const CompanyTopUpWallet = lazyPage(() => import('@/app/pages/company/CompanyTopUpWallet'));
const CompanyWithdrawWallet = lazyPage(
  () => import('@/app/pages/company/CompanyWithdrawWallet'),
);
const CompanyMessages = lazyPage(() => import('@/app/pages/company/CompanyMessages'));
const CompanyHiddenConversations = lazyPage(
  () => import('@/app/pages/company/CompanyHiddenConversations'),
);
const CompanyNotifications = lazyPage(() => import('@/app/pages/company/CompanyNotifications'));
const CompanySettings = lazyPage(() => import('@/app/pages/company/CompanySettings'));

export const companyRoutes = [
  { path: '/company-dashboard', Component: CompanyDashboard },
  { path: '/company/profile', Component: CompanyProfile },
  { path: '/company/jobs', Component: CompanyJobs },
  { path: '/company/services', Component: CompanyServices },
  { path: '/company/contracts', Component: CompanyContracts },
  { path: '/company/applicants', Component: CompanyApplicants },
  { path: '/company/wallet', Component: CompanyWallet },
  { path: '/company/wallet/top-up', Component: CompanyTopUpWallet },
  { path: '/company/wallet/withdraw', Component: CompanyWithdrawWallet },
  { path: '/company/messages', Component: CompanyMessages },
  { path: '/company/messages/hidden', Component: CompanyHiddenConversations },
  { path: '/company/notifications', Component: CompanyNotifications },
  { path: '/company/settings', Component: CompanySettings },
];
