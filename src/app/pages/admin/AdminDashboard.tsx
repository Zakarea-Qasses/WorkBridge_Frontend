import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, Building2, FileText, LoaderCircle, RefreshCw, Users, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import { AdminDashboardResponse, getAdminDashboard } from '@/app/api/endpoints';

function formatAmount(value: number | string | null | undefined, isEnglish: boolean) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return isEnglish ? 'Unavailable' : 'غير متوفر';
  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar', {
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | undefined, isEnglish: boolean) {
  if (!value) return isEnglish ? 'Unavailable' : 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', { dateStyle: 'medium' }).format(date);
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    active: ['Active', 'نشط'],
    paused: ['Paused', 'متوقف'],
    closed: ['Closed', 'مغلق'],
    pending: ['Pending', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
    verified: ['Verified', 'موثق'],
    under_review: ['Under review', 'قيد المراجعة'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status.replaceAll('_', ' ');
}

function statusClass(status: string) {
  if (['active', 'accepted', 'verified'].includes(status)) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (['closed', 'rejected'].includes(status)) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-amber-100 text-amber-800 border-amber-200';
}

function typeLabel(type: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    freelance_project: ['Project', 'مشروع'],
    freelance_service: ['Service', 'خدمة'],
    job_posting: ['Job', 'وظيفة'],
  };

  return labels[type]?.[isEnglish ? 0 : 1] || type.replaceAll('_', ' ');
}

export default function AdminDashboard() {
  const { language, isEnglish } = useLanguage();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDashboard(await getAdminDashboard());
    } catch (requestError) {
      setDashboard(null);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = dashboard?.stats;
  const statCards = [
    {
      label: isEnglish ? 'Total users' : 'إجمالي المستخدمين',
      value: stats?.total_users ?? 0,
      icon: Users,
      note: isEnglish ? 'Non-admin users' : 'بدون حسابات الأدمن',
    },
    {
      label: isEnglish ? 'Verified companies' : 'الشركات الموثقة',
      value: stats?.active_companies ?? 0,
      icon: Building2,
      note: isEnglish ? 'Companies with verified profile' : 'شركات تم توثيقها',
    },
    {
      label: isEnglish ? 'Open disputes' : 'النزاعات المفتوحة',
      value: stats?.open_disputes ?? 0,
      icon: AlertTriangle,
      note: isEnglish ? 'Pending contract reports' : 'بلاغات عقود قيد المراجعة',
    },
    {
      label: isEnglish ? 'Platform profit' : 'أرباح المنصة',
      value: formatAmount(stats?.platform_profit ?? 0, isEnglish),
      icon: Wallet,
      note: isEnglish ? 'Admin wallet earnings' : 'أرباح محفظة الأدمن',
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-2xl bg-primary p-6 text-primary-foreground">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">
                {isEnglish ? 'Admin dashboard' : 'لوحة تحكم الأدمن'}
              </h2>
            </div>
            <Button variant="secondary" disabled={loading} onClick={() => void loadDashboard()}>
              <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
              {isEnglish ? 'Refresh' : 'تحديث'}
            </Button>
          </div>
        </section>

        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-3xl">
                  {loading ? <span className="block h-9 w-24 animate-pulse rounded bg-muted" /> : stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{stat.note}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Dispute alerts' : 'تنبيهات النزاعات'}</CardTitle>
                <CardDescription>
                  {isEnglish ? 'Latest contract reports requiring admin review.' : 'آخر بلاغات العقود التي تحتاج مراجعة.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/disputes">{isEnglish ? 'Open disputes' : 'فتح النزاعات'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="h-40 animate-pulse rounded-md bg-muted" />
              ) : !dashboard?.dispute_alerts.length ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'No dispute alerts currently.' : 'لا توجد تنبيهات نزاعات حاليا.'}
                </div>
              ) : (
                dashboard.dispute_alerts.map((dispute) => (
                  <div key={dispute.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 font-semibold">{dispute.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {dispute.client_name || '-'} / {dispute.freelancer_name || '-'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatAmount(dispute.amount, isEnglish)} - {formatDate(dispute.created_at, isEnglish)}
                        </p>
                      </div>
                      <Badge className={statusClass(dispute.status)}>{statusLabel(dispute.status, isEnglish)}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Quick links' : 'روابط سريعة'}</CardTitle>
              <CardDescription>
                {isEnglish ? 'Main admin sections.' : 'أقسام الأدمن الأساسية.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: isEnglish ? 'Users' : 'المستخدمون', to: '/admin/users', icon: Users },
                { title: isEnglish ? 'Company verification' : 'توثيق الشركات', to: '/admin/verification', icon: Building2 },
                { title: isEnglish ? 'Finance' : 'الإدارة المالية', to: '/admin/finance', icon: Wallet },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="block rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <div className="flex items-center gap-3">
                    <link.icon className="size-5 text-primary" />
                    <span className="font-semibold">{link.title}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Company verification requests' : 'طلبات توثيق الشركات'}</CardTitle>
                <CardDescription>
                  {isEnglish ? 'Latest companies.' : 'آخر الشركات.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/verification">{isEnglish ? 'View all' : 'عرض الكل'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loading && !dashboard?.company_verification_requests.length ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'No companies found.' : 'لا توجد شركات.'}
                </div>
              ) : null}
              {(dashboard?.company_verification_requests || []).map((company) => (
                <div key={company.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{company.company_name || `#${company.id}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.owner_name || '-'} - {company.owner_email || '-'}
                    </p>
                  </div>
                  <Badge className={statusClass(company.status)}>{statusLabel(company.status, isEnglish)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Content needing review' : 'محتوى للمراجعة'}</CardTitle>
                <CardDescription>
                  {isEnglish ? 'Recent projects, services, and jobs.' : 'أحدث المشاريع والخدمات والوظائف.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/projects">{isEnglish ? 'Manage content' : 'إدارة المحتوى'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loading && !dashboard?.content_needing_review.length ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'No content found.' : 'لا يوجد محتوى.'}
                </div>
              ) : null}
              {(dashboard?.content_needing_review || []).map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {typeLabel(item.type, isEnglish)} - {item.owner_name || '-'}
                    </p>
                  </div>
                  <Badge className={statusClass(item.status)}>{statusLabel(item.status, isEnglish)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
