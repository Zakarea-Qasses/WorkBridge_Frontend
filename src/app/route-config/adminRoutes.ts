import { lazyPage } from '@/app/route-config/lazyPage';

const AdminDashboard = lazyPage(() => import('@/app/pages/admin/AdminDashboard'));
const AdminUsers = lazyPage(() => import('@/app/pages/admin/AdminUsers'));
const AdminVerification = lazyPage(() => import('@/app/pages/admin/AdminVerification'));
const AdminDisputes = lazyPage(() => import('@/app/pages/admin/AdminDisputes'));
const AdminFinance = lazyPage(() => import('@/app/pages/admin/AdminFinance'));
const AdminProjects = lazyPage(() => import('@/app/pages/admin/AdminProjects'));
const AdminReports = lazyPage(() => import('@/app/pages/admin/AdminReports'));
const AdminSiteWallet = lazyPage(() => import('@/app/pages/admin/AdminSiteWallet'));
const AdminMessages = lazyPage(() => import('@/app/pages/admin/AdminMessages'));
const AdminNotifications = lazyPage(() => import('@/app/pages/admin/AdminNotifications'));
const AdminSupport = lazyPage(() => import('@/app/pages/admin/AdminSupport'));
const AdminSettings = lazyPage(() => import('@/app/pages/admin/AdminSettings'));

export const adminRoutes = [
  { path: '/admin', Component: AdminDashboard },
  { path: '/admin/users', Component: AdminUsers },
  { path: '/admin/verification', Component: AdminVerification },
  { path: '/admin/disputes', Component: AdminDisputes },
  { path: '/admin/finance', Component: AdminFinance },
  { path: '/admin/projects', Component: AdminProjects },
  { path: '/admin/reports', Component: AdminReports },
  { path: '/admin/site-wallet', Component: AdminSiteWallet },
  { path: '/admin/messages', Component: AdminMessages },
  { path: '/admin/notifications', Component: AdminNotifications },
  { path: '/admin/support', Component: AdminSupport },
  { path: '/admin/settings', Component: AdminSettings },
];
