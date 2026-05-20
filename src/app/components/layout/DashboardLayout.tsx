import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  CircleHelp,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  User,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: 'user' | 'company' | 'admin';
}

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
}

export default function DashboardLayout({
  children,
  userType = 'user',
}: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isEnglish, language } = useLanguage();

  const notificationsLink =
    userType === 'admin'
      ? '/admin/notifications'
      : userType === 'company'
        ? '/company/notifications'
        : '/notifications';

  const messagesLink =
    userType === 'admin'
      ? '/admin/messages'
      : userType === 'company'
        ? '/company/messages'
        : '/messages';

  const settingsLink =
    userType === 'admin'
      ? '/admin/settings'
      : userType === 'company'
        ? '/company/settings'
        : '/settings';

  const notifications = useMemo(
    () => [
      {
        id: 1,
        title: isEnglish ? 'New Message' : 'رسالة جديدة',
        description: isEnglish
          ? 'You have a new message in your conversations.'
          : 'لديك رسالة جديدة في المحادثات.',
        to: messagesLink,
      },
      {
        id: 2,
        title: isEnglish ? 'New Update' : 'تحديث جديد',
        description: isEnglish
          ? userType === 'admin'
            ? 'There is an item waiting for admin review.'
            : userType === 'company'
              ? 'A job or applicant status has been updated.'
              : 'A project or service status has been updated.'
          : userType === 'admin'
            ? 'هناك عنصر يحتاج مراجعة إدارية.'
            : userType === 'company'
              ? 'تم تحديث حالة وظيفة أو متقدم.'
              : 'تم تحديث حالة مشروع أو خدمة.',
        to:
          userType === 'admin'
            ? '/admin/users'
            : userType === 'company'
              ? '/company/jobs'
              : '/projects',
      },
      {
        id: 3,
        title: isEnglish ? 'Financial Alert' : 'تنبيه مالي',
        description: isEnglish
          ? 'A new financial transaction is waiting for review.'
          : 'هناك معاملة جديدة بانتظار المراجعة.',
        to:
          userType === 'admin'
            ? '/admin/site-wallet'
            : userType === 'company'
              ? '/company/wallet'
              : '/wallet',
      },
    ],
    [isEnglish, messagesLink, userType],
  );

  const userMenuItems = useMemo<MenuItem[]>(
    () => [
      { icon: Home, label: isEnglish ? 'Home' : 'الرئيسية', path: '/dashboard' },
      { icon: FileText, label: isEnglish ? 'Projects' : 'المشاريع', path: '/projects' },
      { icon: FileText, label: isEnglish ? 'Contracts' : 'العقود', path: '/contracts' },
      { icon: Briefcase, label: isEnglish ? 'Services' : 'الخدمات', path: '/services' },
      { icon: CheckCircle2, label: isEnglish ? 'Applications' : 'التقديمات', path: '/applications' },
      {
        icon: FileText,
        label: isEnglish ? 'Service Requests' : 'طلبات الخدمات',
        path: '/services/requests',
      },
      { icon: Briefcase, label: isEnglish ? 'Jobs' : 'الوظائف', path: '/jobs' },
      { icon: CheckCircle2, label: isEnglish ? 'My Applications' : 'طلباتي', path: '/applied-jobs' },
      { icon: Bookmark, label: isEnglish ? 'Saved Items' : 'المحفوظات', path: '/saved-jobs' },
      { icon: Wallet, label: isEnglish ? 'Wallet' : 'المحفظة', path: '/wallet' },
      { icon: MessageSquare, label: isEnglish ? 'Messages' : 'المحادثات', path: '/messages' },
      { icon: Bell, label: isEnglish ? 'Notifications' : 'الإشعارات', path: '/notifications' },
      { icon: CircleHelp, label: isEnglish ? 'Support Center' : 'مركز الدعم', path: '/support' },
      { icon: Settings, label: isEnglish ? 'Settings' : 'الإعدادات', path: '/settings' },
    ],
    [isEnglish],
  );

  const companyMenuItems = useMemo<MenuItem[]>(
    () => [
      { icon: Home, label: isEnglish ? 'Company Dashboard' : 'لوحة الشركة', path: '/company-dashboard' },
      { icon: Building2, label: isEnglish ? 'Company Profile' : 'ملف الشركة', path: '/company/profile' },
      { icon: Briefcase, label: isEnglish ? 'Manage Jobs' : 'إدارة الوظائف', path: '/company/jobs' },
      { icon: Search, label: isEnglish ? 'Browse Services' : 'تصفح الخدمات', path: '/company/services' },
      { icon: FileText, label: isEnglish ? 'Company Contracts' : 'عقود الشركة', path: '/company/contracts' },
      { icon: User, label: isEnglish ? 'Applicants' : 'المتقدمون', path: '/company/applicants' },
      { icon: Wallet, label: isEnglish ? 'Company Wallet' : 'محفظة الشركة', path: '/company/wallet' },
      { icon: MessageSquare, label: isEnglish ? 'Messages' : 'المحادثات', path: '/company/messages' },
      { icon: Bell, label: isEnglish ? 'Notifications' : 'الإشعارات', path: '/company/notifications' },
      { icon: Settings, label: isEnglish ? 'Company Settings' : 'إعدادات الشركة', path: '/company/settings' },
    ],
    [isEnglish],
  );

  const adminMenuItems = useMemo<MenuItem[]>(
    () => [
      { icon: Home, label: isEnglish ? 'Admin Dashboard' : 'لوحة التحكم', path: '/admin' },
      { icon: User, label: isEnglish ? 'User Management' : 'إدارة المستخدمين', path: '/admin/users' },
      { icon: Building2, label: isEnglish ? 'Company Verification' : 'توثيق الشركات', path: '/admin/verification' },
      { icon: Shield, label: isEnglish ? 'Disputes & Complaints' : 'النزاعات والشكاوى', path: '/admin/disputes' },
      { icon: FileText, label: isEnglish ? 'Reports Center' : 'مركز التقارير', path: '/admin/reports' },
      { icon: FileText, label: isEnglish ? 'Content Management' : 'إدارة المحتوى', path: '/admin/projects' },
      { icon: Wallet, label: isEnglish ? 'Finance Management' : 'الإدارة المالية', path: '/admin/finance' },
      { icon: Wallet, label: isEnglish ? 'Site Wallet' : 'محفظة الموقع', path: '/admin/site-wallet' },
      { icon: CircleHelp, label: isEnglish ? 'Support Center' : 'مركز الدعم', path: '/admin/support' },
      { icon: MessageSquare, label: isEnglish ? 'Admin Messages' : 'محادثات الأدمن', path: '/admin/messages' },
      { icon: Bell, label: isEnglish ? 'Notifications' : 'الإشعارات', path: '/admin/notifications' },
      { icon: Settings, label: isEnglish ? 'Settings' : 'الإعدادات', path: '/admin/settings' },
    ],
    [isEnglish],
  );

  const menuItems =
    userType === 'admin'
      ? adminMenuItems
      : userType === 'company'
        ? companyMenuItems
        : userMenuItems;

  const activePageTitle =
    menuItems.find((item) => item.path === location.pathname)?.label ||
    (isEnglish ? 'Dashboard' : 'لوحة التحكم');

  const profileLink =
    userType === 'admin'
      ? '/admin'
      : userType === 'company'
        ? '/company/profile'
        : '/profile/1';

  const publicProfileLink =
    userType === 'admin'
      ? '/admin'
      : userType === 'company'
        ? '/company-dashboard'
        : '/freelancers/1';

  const accountName =
    userType === 'admin'
      ? isEnglish
        ? 'Platform Admin'
        : 'أدمن المنصة'
      : userType === 'company'
        ? 'Work Bridge Labs'
        : isEnglish
          ? 'Ahmad Mohammad'
          : 'أحمد محمد';

  return (
    <div className="flex min-h-screen bg-muted" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } fixed right-0 top-0 z-40 flex h-screen w-64 flex-col border-l border-border bg-white transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0`}
      >
        <div className="border-b border-border p-6">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="size-8 text-primary" />
            <span className="text-xl font-bold text-primary">Work Bridge</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Button
                asChild
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
              >
                <Link to={item.path}>
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Button asChild variant="ghost" className="w-full justify-start gap-3 text-destructive">
            <Link to="/">
              <LogOut className="size-5" />
              {isEnglish ? 'Log Out' : 'تسجيل الخروج'}
            </Link>
          </Button>
        </div>
      </aside>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen((current) => !current)}
              >
                <Menu className="size-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">{activePageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              <LanguageToggle />

              <Button asChild variant="ghost" size="icon" className="relative">
                <Link to={notificationsLink}>
                  <Bell className="size-5" />
                  <Badge className="absolute -left-1 -top-1 flex size-5 items-center justify-center p-0 text-xs">
                    {notifications.length}
                  </Badge>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                      {userType === 'company' ? (
                        <Building2 className="size-5 text-primary" />
                      ) : (
                        <User className="size-5 text-primary" />
                      )}
                    </div>
                    <span className="hidden md:inline">{accountName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>{isEnglish ? 'Account' : 'الحساب'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={profileLink} className="cursor-pointer">
                      <User className="ml-2 size-4" />
                      {userType === 'admin'
                        ? isEnglish
                          ? 'Admin Dashboard'
                          : 'لوحة الأدمن'
                        : userType === 'company'
                          ? isEnglish
                            ? 'Company Profile'
                            : 'ملف الشركة'
                          : isEnglish
                            ? 'Profile'
                            : 'الملف الشخصي'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={publicProfileLink} className="cursor-pointer">
                      <Briefcase className="ml-2 size-4" />
                      {userType === 'company'
                        ? isEnglish
                          ? 'Company Dashboard'
                          : 'لوحة الشركة'
                        : userType === 'admin'
                          ? isEnglish
                            ? 'Back to Dashboard'
                            : 'العودة للوحة التحكم'
                          : isEnglish
                            ? 'Public Profile'
                            : 'عرض البروفايل العام'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={settingsLink} className="cursor-pointer">
                      <Settings className="ml-2 size-4" />
                      {isEnglish ? 'Settings' : 'الإعدادات'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" className="cursor-pointer text-destructive">
                      <LogOut className="ml-2 size-4" />
                      {isEnglish ? 'Log Out' : 'تسجيل الخروج'}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
