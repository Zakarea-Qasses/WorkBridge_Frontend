import { lazyPage } from '@/app/route-config/lazyPage';

const Dashboard = lazyPage(() => import('@/app/pages/user/Dashboard'));
const Projects = lazyPage(() => import('@/app/pages/user/Projects'));
const CreateProject = lazyPage(() => import('@/app/pages/user/CreateProject'));
const ProjectDetails = lazyPage(() => import('@/app/pages/user/ProjectDetails'));
const Services = lazyPage(() => import('@/app/pages/user/Services'));
const Contracts = lazyPage(() => import('@/app/pages/user/Contracts'));
const Applications = lazyPage(() => import('@/app/pages/user/Applications'));
const CreateService = lazyPage(() => import('@/app/pages/user/CreateService'));
const MyServices = lazyPage(() => import('@/app/pages/user/MyServices'));
const ServiceRequests = lazyPage(() => import('@/app/pages/user/ServiceRequests'));
const Jobs = lazyPage(() => import('@/app/pages/user/Jobs'));
const Wallet = lazyPage(() => import('@/app/pages/user/Wallet'));
const TopUpWallet = lazyPage(() => import('@/app/pages/user/TopUpWallet'));
const WithdrawWallet = lazyPage(() => import('@/app/pages/user/WithdrawWallet'));
const Messages = lazyPage(() => import('@/app/pages/user/Messages'));
const Notifications = lazyPage(() => import('@/app/pages/user/Notifications'));
const AppliedJobs = lazyPage(() => import('@/app/pages/user/AppliedJobs'));
const Profile = lazyPage(() => import('@/app/pages/user/Profile'));
const Settings = lazyPage(() => import('@/app/pages/user/Settings'));
const SupportCenter = lazyPage(() => import('@/app/pages/user/SupportCenter'));

export const userRoutes = [
  { path: '/dashboard', Component: Dashboard },
  { path: '/dashboard/personal', Component: Dashboard },
  { path: '/projects', Component: Projects },
  { path: '/projects/create', Component: CreateProject },
  { path: '/projects/:id', Component: ProjectDetails },
  { path: '/services', Component: Services },
  { path: '/contracts', Component: Contracts },
  { path: '/applications', Component: Applications },
  { path: '/services/create', Component: CreateService },
  { path: '/services/my', Component: MyServices },
  { path: '/services/requests', Component: ServiceRequests },
  { path: '/jobs', Component: Jobs },
  { path: '/wallet', Component: Wallet },
  { path: '/wallet/top-up', Component: TopUpWallet },
  { path: '/wallet/withdraw', Component: WithdrawWallet },
  { path: '/messages', Component: Messages },
  { path: '/notifications', Component: Notifications },
  { path: '/applied-jobs', Component: AppliedJobs },
  { path: '/profile', Component: Profile },
  { path: '/profile/:id', Component: Profile },
  { path: '/settings', Component: Settings },
  { path: '/support', Component: SupportCenter },
  { path: '/complaints', Component: SupportCenter },
];
