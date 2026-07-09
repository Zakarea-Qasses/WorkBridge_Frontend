import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { ApiError } from '@/app/api/client';
import { getPersonalDashboard, PersonalDashboardResponse } from '@/app/api/endpoints';
import { getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { formatUsd } from '@/app/utils/money';

function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-lg bg-muted" />
        <div className="h-44 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function formatNumber(value: number | string | null | undefined, isEnglish: boolean) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '0';
  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar').format(amount);
}

function formatDate(value: string | null | undefined, isEnglish: boolean) {
  if (!value) return isEnglish ? 'Unavailable' : 'غير متاح';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Unavailable' : 'غير متاح';
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
  }).format(date);
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    active: ['Active', 'نشط'],
    paused: ['Paused', 'متوقف'],
    closed: ['Closed', 'مغلق'],
    pending: ['Pending', 'قيد الانتظار'],
    funded: ['Funded', 'ممولة'],
    in_progress: ['In progress', 'قيد التنفيذ'],
    completed: ['Completed', 'مكتمل'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
    approved: ['Approved', 'مقبول'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status.replaceAll('_', ' ');
}

function activityTypeLabel(type: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    project_application: ['Project offer', 'عرض مشروع'],
    service_request: ['Service request', 'طلب خدمة'],
    wallet_request_deposit: ['Deposit request', 'طلب شحن'],
    wallet_request_withdraw: ['Withdrawal request', 'طلب سحب'],
  };

  return labels[type]?.[isEnglish ? 0 : 1] || type.replaceAll('_', ' ');
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Briefcase;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          {title}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const { user, initializing } = useAuth();
  const [dashboard, setDashboard] = useState<PersonalDashboardResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    if (initializing || user?.role !== 'personal') {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await getPersonalDashboard();
      if (requestId !== requestIdRef.current) {
        return;
      }

      setDashboard(response);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setDashboard(null);

      if (error instanceof ApiError && error.status === 403) {
        setErrorMessage(
          isEnglish
            ? 'You do not have permission to access the personal dashboard.'
            : 'ليس لديك صلاحية للوصول إلى لوحة التحكم الشخصية',
        );
        window.setTimeout(() => {
          navigate(getDashboardPathForUser(user), { replace: true });
        }, 1200);
      } else if (error instanceof ApiError && error.status === 404) {
        setErrorMessage(
          isEnglish
            ? 'The personal dashboard is currently unavailable.'
            : 'لوحة التحكم الشخصية غير متاحة حاليًا',
        );
      } else {
        setErrorMessage(
          isEnglish
            ? 'Unable to load dashboard data.'
            : 'تعذر تحميل بيانات لوحة التحكم',
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [initializing, isEnglish, navigate, user]);

  useEffect(() => {
    loadDashboard();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDashboard]);

  const displayedUser = dashboard?.user || user;
  const stats = dashboard?.stats;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {isLoading ? <DashboardLoading /> : null}

        {!isLoading && errorMessage ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <p className="text-lg font-medium">{errorMessage}</p>
              <Button onClick={loadDashboard}>
                <RefreshCw className="me-2 size-4" />
                {isEnglish ? 'Try again' : 'إعادة المحاولة'}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && dashboard ? (
          <>
            <div className="rounded-lg bg-gradient-to-l from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    {isEnglish
                      ? `Welcome, ${displayedUser?.name || ''}`
                      : `مرحبًا، ${displayedUser?.name || ''}`}
                  </h2>
                  <p className="text-blue-100">
                    {isEnglish
                      ? 'Your personal Work Bridge account is ready.'
                      : dashboard.message}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  title={isEnglish ? 'Refresh dashboard' : 'تحديث لوحة التحكم'}
                  aria-label={isEnglish ? 'Refresh dashboard' : 'تحديث لوحة التحكم'}
                  onClick={loadDashboard}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title={isEnglish ? 'Projects' : 'المشاريع'}
                value={formatNumber(stats?.total_projects, isEnglish)}
                detail={
                  isEnglish
                    ? `${formatNumber(stats?.active_projects, isEnglish)} active projects`
                    : `${formatNumber(stats?.active_projects, isEnglish)} مشاريع نشطة`
                }
                icon={Briefcase}
              />
              <StatCard
                title={isEnglish ? 'Services' : 'الخدمات'}
                value={formatNumber(stats?.total_services, isEnglish)}
                detail={
                  isEnglish
                    ? `${formatNumber(stats?.active_services, isEnglish)} active services`
                    : `${formatNumber(stats?.active_services, isEnglish)} خدمات نشطة`
                }
                icon={Star}
              />
              <StatCard
                title={isEnglish ? 'Applications' : 'التقديمات'}
                value={formatNumber(
                  (stats?.project_applications_sent || 0) + (stats?.job_applications_sent || 0),
                  isEnglish,
                )}
                detail={
                  isEnglish
                    ? `${formatNumber(stats?.project_applications_received, isEnglish)} offers received`
                    : `${formatNumber(stats?.project_applications_received, isEnglish)} عروض واردة`
                }
                icon={TrendingUp}
              />
              <StatCard
                title={isEnglish ? 'Wallet' : 'المحفظة'}
                value={formatUsd(stats?.wallet_balance || 0, isEnglish ? 'en' : 'ar')}
                detail={
                  isEnglish
                    ? `${formatNumber(stats?.pending_wallet_requests, isEnglish)} pending wallet requests`
                    : `${formatNumber(stats?.pending_wallet_requests, isEnglish)} طلبات محفظة قيد المراجعة`
                }
                icon={Wallet}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Quick Actions' : 'إجراءات سريعة'}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/projects">
                    <Briefcase className="size-5" />
                    {isEnglish ? 'Browse available projects' : 'تصفح المشاريع المتاحة'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/services">
                    <Star className="size-5" />
                    {isEnglish ? 'Browse services' : 'تصفح الخدمات'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/jobs">
                    <TrendingUp className="size-5" />
                    {isEnglish ? 'Find a job' : 'البحث عن وظيفة'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/support">
                    <AlertCircle className="size-5" />
                    {isEnglish ? 'Support center' : 'مركز الدعم'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Recent activity' : 'آخر النشاطات'}</CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'Latest project offers, service requests, and wallet requests.'
                      : 'آخر عروض المشاريع وطلبات الخدمات وطلبات المحفظة.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!dashboard.recent_activity.length ? (
                    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                      {isEnglish ? 'No recent activity yet.' : 'لا توجد نشاطات حديثة حتى الآن.'}
                    </div>
                  ) : (
                    dashboard.recent_activity.map((activity) => (
                      <div key={activity.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activityTypeLabel(activity.type, isEnglish)} - {formatDate(activity.created_at, isEnglish)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {activity.amount !== null ? (
                            <span className="text-sm font-semibold">
                              {formatUsd(activity.amount, isEnglish ? 'en' : 'ar')}
                            </span>
                          ) : null}
                          <Badge variant="outline">{statusLabel(activity.status, isEnglish)}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Contracts summary' : 'ملخص العقود'}</CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'Active and completed contracts linked to your account.'
                      : 'العقود الفعالة والمكتملة المرتبطة بحسابك.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md bg-muted p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        {isEnglish ? 'Active' : 'فعالة'}
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {formatNumber(stats?.active_contracts, isEnglish)}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="size-4" />
                        {isEnglish ? 'Completed' : 'مكتملة'}
                      </div>
                      <p className="mt-2 text-2xl font-bold">
                        {formatNumber(stats?.completed_contracts, isEnglish)}
                      </p>
                    </div>
                  </div>

                  {!dashboard.active_contracts.length ? (
                    <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
                      {isEnglish ? 'No active contracts currently.' : 'لا توجد عقود فعالة حالياً.'}
                    </div>
                  ) : (
                    dashboard.active_contracts.map((contract) => (
                      <div key={contract.id} className="rounded-md border p-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {contract.title || (isEnglish ? `Contract #${contract.id}` : `العقد رقم ${contract.id}`)}
                            </p>
                            <p className="text-muted-foreground">{formatDate(contract.created_at, isEnglish)}</p>
                          </div>
                          <Badge variant="outline">{statusLabel(contract.status, isEnglish)}</Badge>
                        </div>
                        <p className="mt-2 font-semibold">
                          {formatUsd(contract.amount, isEnglish ? 'en' : 'ar')}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Recent projects' : 'آخر المشاريع'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!dashboard.recent_projects.length ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {isEnglish ? 'You have not posted projects yet.' : 'لم تنشر مشاريع حتى الآن.'}
                  </div>
                ) : (
                  dashboard.recent_projects.map((project) => (
                    <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.category_name || (isEnglish ? 'No category' : 'بدون تصنيف')} - {formatDate(project.created_at, isEnglish)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {formatUsd(project.budget, isEnglish ? 'en' : 'ar')}
                        </span>
                        <Badge variant="outline">{statusLabel(project.status, isEnglish)}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
