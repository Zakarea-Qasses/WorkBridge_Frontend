import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router';
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { ApiError, getApiErrorMessage } from '@/app/api/client';
import {
  type CompanyDashboardResponse,
  getCompanyDashboard,
} from '@/app/api/pages/company/dashboard';
import {
  type CompanyProfile,
  getCompany,
} from '@/app/api/pages/company/dashboard';
import {
  type Contract,
  getCompanyContractsPage,
} from '@/app/api/pages/company/dashboard';
import {
  type JobApplication,
  type JobPost,
  getCompanyJobsPage,
  getJobApplications,
} from '@/app/api/pages/company/dashboard';
import {
  getMyServiceRequestsPage,
  type ServiceRequest,
} from '@/app/api/pages/company/dashboard';
import { getMyWallet } from '@/app/api/pages/company/dashboard';
import DashboardLayout from '@/app/components/layout';
import { formatUsd } from '@/app/utils/money';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

type StatusMessage = {
  type: 'error' | 'info';
  message: string;
} | null;

interface CompanyStats {
  jobsTotal: number;
  activeJobs: number;
  pausedJobs: number;
  closedJobs: number;
  applicationsTotal: number;
  pendingApplications: number;
  acceptedApplications: number;
  contractsTotal: number;
  activeContracts: number;
  completedContracts: number;
  serviceRequestsTotal: number;
  acceptedServiceRequests: number;
  walletBalance: number | null;
  recentJobs: JobPost[];
  recentApplications: JobApplication[];
  recentContracts: Contract[];
  recentServiceRequests: ServiceRequest[];
}

const emptyStats: CompanyStats = {
  jobsTotal: 0,
  activeJobs: 0,
  pausedJobs: 0,
  closedJobs: 0,
  applicationsTotal: 0,
  pendingApplications: 0,
  acceptedApplications: 0,
  contractsTotal: 0,
  activeContracts: 0,
  completedContracts: 0,
  serviceRequestsTotal: 0,
  acceptedServiceRequests: 0,
  walletBalance: null,
  recentJobs: [],
  recentApplications: [],
  recentContracts: [],
  recentServiceRequests: [],
};

function getRoleLabel(role: string | undefined, isEnglish: boolean) {
  if (role === 'company') {
    return isEnglish ? 'Company account' : 'حساب شركة';
  }

  return isEnglish ? 'Unknown role' : 'دور غير معروف';
}

function getAccountStatusLabel(status: string | undefined, isEnglish: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    active: { en: 'Active', ar: 'نشط' },
    pending_review: { en: 'Pending review', ar: 'قيد الانتظار' },
    under_review: { en: 'Under review', ar: 'قيد المراجعة' },
    blocked: { en: 'Blocked', ar: 'محظور' },
    unactive: { en: 'Inactive', ar: 'غير نشط' },
  };

  if (!status) {
    return isEnglish ? 'Not provided' : 'غير متوفر';
  }

  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function getDashboardErrorMessage(error: unknown, isEnglish: boolean) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return isEnglish
        ? 'You are not allowed to access the company dashboard.'
        : 'ليس لديك صلاحية للوصول إلى لوحة تحكم الشركة.';
    }

    if (error.status >= 500) {
      return isEnglish ? 'Could not load company dashboard data.' : 'تعذر تحميل بيانات لوحة تحكم الشركة.';
    }
  }

  return getApiErrorMessage(error);
}

function formatNumber(value: number, isEnglish: boolean) {
  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar').format(value);
}

function formatMoney(value: number | null, isEnglish: boolean) {
  if (value === null) return isEnglish ? 'Unavailable' : 'غير متاح';
  return formatUsd(value, isEnglish ? 'en' : 'ar');
}

function formatDate(value: string | null | undefined, isEnglish: boolean) {
  if (!value) return isEnglish ? 'Not available' : 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Not available' : 'غير متوفر';
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function contractStatusLabel(status: Contract['status'], isEnglish: boolean) {
  const labels: Record<Contract['status'], [string, string]> = {
    pending: ['Pending', 'بانتظار التمويل'],
    funded: ['Funded', 'ممولة'],
    in_progress: ['In progress', 'قيد التنفيذ'],
    completed: ['Completed', 'مكتمل'],
    canceled: ['Canceled', 'ملغى'],
    refunded: ['Refunded', 'تم رد المبلغ'],
    dispute: ['In dispute', 'قيد النزاع'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status;
}

function applicationStatusLabel(status: JobApplication['status'], isEnglish: boolean) {
  const labels: Record<JobApplication['status'], [string, string]> = {
    pending: ['Pending', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status;
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
  icon: typeof BriefcaseBusiness;
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

async function loadAllCompanyJobs() {
  const firstPage = await getCompanyJobsPage(1);
  const pages = [firstPage];

  for (let page = 2; page <= firstPage.last_page; page += 1) {
    pages.push(await getCompanyJobsPage(page));
  }

  return pages.flatMap((page) => page.data);
}

function sortByNewest<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
}

async function loadCompanyStats(): Promise<CompanyStats> {
  const [jobs, contractsPage, serviceRequestsPage, walletResult] = await Promise.all([
    loadAllCompanyJobs(),
    getCompanyContractsPage(1),
    getMyServiceRequestsPage(1),
    getMyWallet().catch(() => null),
  ]);

  const applicationsGroups = await Promise.all(jobs.map((job) => getJobApplications(job.id).catch(() => [])));
  const applications = applicationsGroups.flat();
  const contracts = contractsPage.data;
  const serviceRequests = serviceRequestsPage.data;
  const walletBalance = walletResult ? Number(walletResult.balance) : null;

  return {
    jobsTotal: jobs.length,
    activeJobs: jobs.filter((job) => job.status === 'active').length,
    pausedJobs: jobs.filter((job) => job.status === 'paused').length,
    closedJobs: jobs.filter((job) => job.status === 'closed').length,
    applicationsTotal: applications.length,
    pendingApplications: applications.filter((application) => application.status === 'pending').length,
    acceptedApplications: applications.filter((application) => application.status === 'accepted').length,
    contractsTotal: contractsPage.total,
    activeContracts: contracts.filter((contract) => ['funded', 'in_progress'].includes(contract.status)).length,
    completedContracts: contracts.filter((contract) => contract.status === 'completed').length,
    serviceRequestsTotal: serviceRequestsPage.total,
    acceptedServiceRequests: serviceRequests.filter((request) => request.status === 'accepted').length,
    walletBalance: Number.isFinite(walletBalance) ? walletBalance : null,
    recentJobs: sortByNewest(jobs).slice(0, 4),
    recentApplications: sortByNewest(applications).slice(0, 4),
    recentContracts: sortByNewest(contracts).slice(0, 4),
    recentServiceRequests: sortByNewest(serviceRequests).slice(0, 4),
  };
}

function DashboardSkeleton({ isEnglish }: { isEnglish: boolean }) {
  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={isEnglish ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="space-y-3">
            <div className="h-8 w-56 animate-pulse rounded bg-white/20" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/20" />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
              <CardHeader className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function CompanyDashboard() {
  const { language, isEnglish } = useLanguage();
  const { user, initializing } = useAuth();
  const requestIdRef = useRef(0);
  const [dashboard, setDashboard] = useState<CompanyDashboardResponse | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [stats, setStats] = useState<CompanyStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusMessage>(null);

  const isCompanyUser = user?.role === 'company';
  const activeUserId = user?.id ?? null;

  const loadDashboard = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setDashboard(null);
    setCompanyProfile(null);
    setStats(emptyStats);
    setStatus(null);

    if (!isCompanyUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [dashboardResponse, statsResponse, companyResponse] = await Promise.all([
        getCompanyDashboard(),
        loadCompanyStats(),
        getCompany<CompanyProfile>().catch(() => null),
      ]);

      if (requestId !== requestIdRef.current || activeUserId === null || dashboardResponse.user.id !== activeUserId) {
        return;
      }

      setDashboard(dashboardResponse);
      setCompanyProfile(companyResponse);
      setStats(statsResponse);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setStatus({
          type: 'error',
          message: getDashboardErrorMessage(error, isEnglish),
        });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [activeUserId, isCompanyUser, isEnglish]);

  useEffect(() => {
    if (initializing) return;
    void loadDashboard();
  }, [initializing, loadDashboard]);

  const dashboardUser = dashboard?.user;
  const company = companyProfile || dashboardUser?.company;
  const companyName = company?.company_name || dashboardUser?.name || (isEnglish ? 'Company' : 'الشركة');

  const summaryCards = useMemo(
    () => [
      {
        title: isEnglish ? 'Jobs' : 'الوظائف',
        value: formatNumber(stats.jobsTotal, isEnglish),
        detail: isEnglish
          ? `${stats.activeJobs} active, ${stats.pausedJobs} paused`
          : `${formatNumber(stats.activeJobs, isEnglish)} نشطة، ${formatNumber(stats.pausedJobs, isEnglish)} متوقفة`,
        icon: BriefcaseBusiness,
      },
      {
        title: isEnglish ? 'Applications' : 'التقديمات',
        value: formatNumber(stats.applicationsTotal, isEnglish),
        detail: isEnglish
          ? `${stats.pendingApplications} pending, ${stats.acceptedApplications} accepted`
          : `${formatNumber(stats.pendingApplications, isEnglish)} قيد المراجعة، ${formatNumber(stats.acceptedApplications, isEnglish)} مقبولة`,
        icon: Users,
      },
      {
        title: isEnglish ? 'Contracts' : 'العقود',
        value: formatNumber(stats.contractsTotal, isEnglish),
        detail: isEnglish
          ? `${stats.activeContracts} active, ${stats.completedContracts} completed`
          : `${formatNumber(stats.activeContracts, isEnglish)} فعالة، ${formatNumber(stats.completedContracts, isEnglish)} مكتملة`,
        icon: FileText,
      },
      {
        title: isEnglish ? 'Wallet' : 'المحفظة',
        value: formatMoney(stats.walletBalance, isEnglish),
        detail: isEnglish ? 'Current company wallet balance' : 'رصيد محفظة الشركة الحالي',
        icon: Wallet,
      },
    ],
    [isEnglish, stats],
  );

  if (initializing || loading) {
    return <DashboardSkeleton isEnglish={isEnglish} />;
  }

  if (!isCompanyUser) {
    return <Navigate to={getDashboardPathForUser(user)} replace />;
  }

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">
                {isEnglish ? `Welcome, ${companyName}` : `مرحبا، ${companyName}`}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <Badge className="border-white/20 bg-white/10 px-4 py-1 text-white">
                {getRoleLabel(dashboard?.role || dashboardUser?.role, isEnglish)}
              </Badge>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2 bg-white/15 px-4 text-white hover:bg-white/25"
                onClick={() => void loadDashboard()}
              >
                <RefreshCw className="size-4" />
                {isEnglish ? 'Refresh data' : 'تحديث البيانات'}
              </Button>
            </div>
          </div>
        </section>

        {status ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="pt-6 text-sm text-destructive">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {status.message}
                </span>
                <Button variant="outline" size="sm" onClick={() => void loadDashboard()}>
                  <RefreshCw className="me-2 h-4 w-4" />
                  {isEnglish ? 'Retry' : 'إعادة المحاولة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-100 bg-blue-50 text-blue-900 shadow-sm">
            <CardHeader className="min-h-28 pb-3">
              <CardDescription className="flex items-center gap-2 text-base text-blue-800">
                <User className="h-4 w-4" />
                {isEnglish ? 'Account owner' : 'مالك الحساب'}
              </CardDescription>
              <CardTitle className="mt-2 text-2xl">{dashboardUser?.name || '-'}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50 text-emerald-900 shadow-sm">
            <CardHeader className="min-h-28 pb-3">
              <CardDescription className="flex items-center gap-2 text-base text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                {isEnglish ? 'Account status' : 'حالة الحساب'}
              </CardDescription>
              <CardTitle className="mt-2 text-2xl">{getAccountStatusLabel(dashboardUser?.status, isEnglish)}</CardTitle>
            </CardHeader>
          </Card>

        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Recent activity' : 'آخر النشاطات'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Aggregated from company jobs, applications, service requests, and contracts.'
                  : 'مجمعة من وظائف الشركة، التقديمات، طلبات الخدمات، والعقود.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="mb-2 font-semibold">{isEnglish ? 'Recent applications' : 'آخر التقديمات'}</h3>
                {!stats.recentApplications.length ? (
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'No applications yet.' : 'لا توجد تقديمات بعد.'}</p>
                ) : (
                  <div className="space-y-2">
                    {stats.recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                        <div>
                          <p className="font-medium">{application.user?.name || (isEnglish ? 'Applicant' : 'متقدم')}</p>
                          <p className="text-muted-foreground">{application.job?.title || (isEnglish ? 'Job unavailable' : 'الوظيفة غير متاحة')}</p>
                        </div>
                        <Badge variant="outline">{applicationStatusLabel(application.status, isEnglish)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">{isEnglish ? 'Recent contracts' : 'آخر العقود'}</h3>
                {!stats.recentContracts.length ? (
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'No contracts yet.' : 'لا توجد عقود بعد.'}</p>
                ) : (
                  <div className="space-y-2">
                    {stats.recentContracts.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                        <div>
                          <p className="font-medium">
                            {contract.service_request?.title ||
                              contract.job_post?.title ||
                              contract.project?.title ||
                              (isEnglish ? `Contract #${contract.id}` : `العقد رقم ${contract.id}`)}
                          </p>
                          <p className="text-muted-foreground">{formatDate(contract.created_at, isEnglish)}</p>
                        </div>
                        <Badge variant="outline">{contractStatusLabel(contract.status, isEnglish)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Quick shortcuts' : 'اختصارات سريعة'}</CardTitle>
              <CardDescription>
                {isEnglish ? 'Open the main company work areas.' : 'انتقل بسرعة إلى أقسام الشركة الأساسية.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/company/jobs">
                  <BriefcaseBusiness className="me-2 h-4 w-4" />
                  {isEnglish ? 'Manage jobs' : 'إدارة الوظائف'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/company/applicants">
                  <Users className="me-2 h-4 w-4" />
                  {isEnglish ? 'Review applicants' : 'مراجعة المتقدمين'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/company/service-requests">
                  <Clock className="me-2 h-4 w-4" />
                  {isEnglish ? 'Service requests' : 'طلبات الخدمات'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/company/contracts">
                  <FileText className="me-2 h-4 w-4" />
                  {isEnglish ? 'Company contracts' : 'عقود الشركة'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Recent jobs' : 'آخر الوظائف'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!stats.recentJobs.length ? (
                <p className="text-sm text-muted-foreground">{isEnglish ? 'No jobs yet.' : 'لا توجد وظائف بعد.'}</p>
              ) : (
                stats.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-muted-foreground">{formatDate(job.created_at, isEnglish)}</p>
                    </div>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Service requests' : 'طلبات الخدمات'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? `${stats.acceptedServiceRequests} accepted out of ${stats.serviceRequestsTotal}`
                  : `${formatNumber(stats.acceptedServiceRequests, isEnglish)} مقبولة من أصل ${formatNumber(stats.serviceRequestsTotal, isEnglish)}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!stats.recentServiceRequests.length ? (
                <p className="text-sm text-muted-foreground">{isEnglish ? 'No service requests yet.' : 'لا توجد طلبات خدمات بعد.'}</p>
              ) : (
                stats.recentServiceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-muted-foreground">{formatDate(request.created_at, isEnglish)}</p>
                    </div>
                    <Badge variant="outline">{request.status}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
