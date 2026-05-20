import { lazyPage } from '@/app/route-config/lazyPage';

const Landing = lazyPage(() => import('@/app/pages/public/Landing'));
const HelpCenter = lazyPage(() => import('@/app/pages/public/HelpCenter'));
const Login = lazyPage(() => import('@/app/pages/auth/Login'));
const Privacy = lazyPage(() => import('@/app/pages/public/Privacy'));
const Register = lazyPage(() => import('@/app/pages/auth/Register'));
const Terms = lazyPage(() => import('@/app/pages/public/Terms'));
const EmailVerification = lazyPage(() => import('@/app/pages/auth/EmailVerification'));
const ForgotPassword = lazyPage(() => import('@/app/pages/auth/ForgotPassword'));

export const authRoutes = [
  { path: '/', Component: Landing },
  { path: '/help', Component: HelpCenter },
  { path: '/login', Component: Login },
  { path: '/privacy', Component: Privacy },
  { path: '/register', Component: Register },
  { path: '/terms', Component: Terms },
  { path: '/verify-email', Component: EmailVerification },
  { path: '/forgot-password', Component: ForgotPassword },
];
