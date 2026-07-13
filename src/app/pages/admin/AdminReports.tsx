import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, Search } from 'lucide-react';
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getAllReports,
  Report,
  ReportAttachment,
  ReportDecisionPayload,
  updateReportDecision,
} from '@/app/api/pages/admin/reports';
import { formatUsd } from '@/app/utils/money';

type StatusMessage = { type: 'success' | 'error'; message: string } | null;
type ReportStatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';
type ReportCategoryFilter = 'all' | 'support' | 'complaint' | 'technical';
type AdminAction = NonNullable<ReportDecisionPayload['admin_action']> | 'none';

function isContractCase(report: Report) {
  return Boolean(
    report.contract_id ||
      report.target_type === 'contract' ||
      ['dispute', 'payment'].includes(report.category),
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

function attachmentValue(attachment: ReportAttachment) {
  return typeof attachment === 'string'
    ? attachment
    : attachment.url || attachment.path || attachment.name || '';
}

function isProbablyFileReference(attachment: ReportAttachment) {
  const value = attachmentValue(attachment);
  return /^https?:\/\//i.test(value)
    || value.startsWith('/')
    || value.startsWith('storage/')
    || value.startsWith('reports/')
    || value.startsWith('attachments/')
    || /\.(pdf|png|jpe?g|webp|gif|docx?|xlsx?|zip)$/i.test(value);
}

function getAttachmentUrl(attachment: ReportAttachment) {
  const value = attachmentValue(attachment);
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalized = value.replace(/^\/+/, '');
  const storagePath = normalized.startsWith('storage/') ? normalized : `storage/${normalized}`;

  return `${BACKEND_BASE_URL}/${storagePath}`;
}

function getAttachmentLabel(attachment: ReportAttachment) {
  const value = typeof attachment === 'string'
    ? attachment
    : attachment.name || attachment.path || attachment.url || '';

  try {
    const withoutQuery = value.split('?')[0];
    return decodeURIComponent(withoutQuery.split('/').filter(Boolean).pop() || value);
  } catch {
    return value;
  }
}

function categoryLabel(category: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    support: { ar: 'دعم عام', en: 'Support' },
    complaint: { ar: 'شكوى', en: 'Complaint' },
    dispute: { ar: 'نزاع', en: 'Dispute' },
    payment: { ar: 'مشكلة دفع', en: 'Payment' },
    technical: { ar: 'مشكلة تقنية', en: 'Technical' },
  };

  return isEnglish ? labels[category]?.en || category : labels[category]?.ar || category;
}

function priorityLabel(priority: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    low: { ar: 'منخفضة', en: 'Low' },
    normal: { ar: 'عادية', en: 'Normal' },
    high: { ar: 'عالية', en: 'High' },
  };

  return isEnglish ? labels[priority]?.en || priority : labels[priority]?.ar || priority;
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'قيد المراجعة', en: 'Pending' },
    accepted: { ar: 'مقبول', en: 'Accepted' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function targetTypeLabel(targetType: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    user: { ar: 'مستخدم', en: 'User' },
    project: { ar: 'مشروع', en: 'Project' },
    service: { ar: 'خدمة', en: 'Service' },
    contract: { ar: 'عقد', en: 'Contract' },
    general: { ar: 'عام', en: 'General' },
  };

  return isEnglish ? labels[targetType]?.en || targetType : labels[targetType]?.ar || targetType;
}

function statusClasses(status: string) {
  if (status === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function priorityClasses(priority: string) {
  if (priority === 'high') return 'bg-red-100 text-red-700 border-red-200';
  if (priority === 'low') return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

function formatDate(value: string, isEnglish: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Date unavailable' : 'التاريخ غير متاح';
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatAmount(value: number | string | null | undefined, isEnglish: boolean) {
  if (value === null || value === undefined || value === '') {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  return formatUsd(value, isEnglish ? 'en' : 'ar');
}

function StatusBox({ status }: { status: StatusMessage }) {
  if (!status) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${
        status.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-destructive/30 bg-destructive/5 text-destructive'
      }`}
    >
      {status.type === 'success' ? (
        <CheckCircle2 className="size-4 shrink-0" />
      ) : (
        <AlertCircle className="size-4 shrink-0" />
      )}
      {status.message}
    </div>
  );
}

export default function AdminReports() {
  const { language, isEnglish } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [decisionNotes, setDecisionNotes] = useState<Record<number, string>>({});
  const [adminActions, setAdminActions] = useState<Record<number, AdminAction>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      setReports((await getAllReports()).filter((report) => !isContractCase(report)));
    } catch (error) {
      setReports([]);
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not load reports.' : 'تعذر تحميل البلاغات'),
      });
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
      const searchable = [
        report.title || '',
        report.description,
        report.reporter?.name || '',
        report.reporter?.email || '',
        report.target_type,
        String(report.target_id || ''),
        String(report.contract_id || ''),
        report.target_summary?.title || '',
        report.target_summary?.owner_name || '',
        report.target_summary?.email || '',
        report.contract_summary?.subject_title || '',
        report.contract_summary?.client_name || '',
        report.contract_summary?.freelancer_name || '',
      ]
        .join(' ')
        .toLowerCase();

      return matchesStatus && matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [categoryFilter, reports, search, statusFilter]);

  const decide = async (report: Report, decision: 'accepted' | 'rejected') => {
    try {
      setBusyId(report.id);
      setStatus(null);

      const adminAction = adminActions[report.id] || 'none';
      const payload: ReportDecisionPayload = {
        status: decision,
        admin_decision: decisionNotes[report.id]?.trim() || null,
      };

      if (decision === 'accepted' && report.contract_id && adminAction !== 'none') {
        payload.admin_action = adminAction;
      }

      const updated = await updateReportDecision(report.id, payload);
      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, ...updated, reporter: updated.reporter || item.reporter } : item,
        ),
      );
      setStatus({
        type: 'success',
        message: isEnglish ? 'Report decision saved successfully.' : 'تم حفظ قرار البلاغ بنجاح.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not save report decision.' : 'تعذر حفظ قرار البلاغ'),
      });
    } finally {
      setBusyId(null);
    }
  };

  const pendingReports = reports.filter((report) => report.status === 'pending');
  const acceptedReports = reports.filter((report) => report.status === 'accepted');
  const rejectedReports = reports.filter((report) => report.status === 'rejected');

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Reports Management' : 'إدارة البلاغات'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Review support requests, technical issues, and content reports.'
                : 'مراجعة طلبات الدعم والمشاكل التقنية وبلاغات المحتوى.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadReports()}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        <StatusBox status={status} />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Pending' : 'قيد المراجعة'}</p>
              <p className="mt-1 text-3xl font-bold">{pendingReports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Accepted' : 'مقبولة'}</p>
              <p className="mt-1 text-3xl font-bold">{acceptedReports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Rejected' : 'مرفوضة'}</p>
              <p className="mt-1 text-3xl font-bold">{rejectedReports.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'All reports' : 'كل البلاغات'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? `${filteredReports.length} reports shown from ${reports.length}.`
                : `${filteredReports.length} بلاغ معروض من أصل ${reports.length}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input
                  className="ltr:pl-9 rtl:pr-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={isEnglish ? 'Search reports' : 'ابحث في البلاغات'}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All statuses' : 'كل الحالات'}</SelectItem>
                  <SelectItem value="pending">{statusLabel('pending', isEnglish)}</SelectItem>
                  <SelectItem value="accepted">{statusLabel('accepted', isEnglish)}</SelectItem>
                  <SelectItem value="rejected">{statusLabel('rejected', isEnglish)}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ReportCategoryFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All categories' : 'كل الأنواع'}</SelectItem>
                  <SelectItem value="support">{categoryLabel('support', isEnglish)}</SelectItem>
                  <SelectItem value="complaint">{categoryLabel('complaint', isEnglish)}</SelectItem>
                  <SelectItem value="technical">{categoryLabel('technical', isEnglish)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <LoaderCircle className="size-8 animate-spin text-primary" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'No reports match the current filters.' : 'لا توجد بلاغات مطابقة للفلاتر الحالية.'}
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{report.title || `${isEnglish ? 'Report' : 'بلاغ'} #${report.id}`}</CardTitle>
                        <CardDescription>
                          {report.reporter?.name || (isEnglish ? 'Unknown user' : 'مستخدم غير معروف')} -{' '}
                          {report.reporter?.email || (isEnglish ? 'No email' : 'لا يوجد بريد')} -{' '}
                          {formatDate(report.created_at, isEnglish)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{categoryLabel(report.category, isEnglish)}</Badge>
                        <Badge className={priorityClasses(report.priority)}>
                          {priorityLabel(report.priority, isEnglish)}
                        </Badge>
                        <Badge className={statusClasses(report.status)}>
                          {statusLabel(report.status, isEnglish)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 rounded-md border bg-muted/20 p-3 text-sm lg:grid-cols-2">
                      <div className="space-y-1">
                        <p className="font-medium">{isEnglish ? 'Reported target' : 'الهدف المبلغ عنه'}</p>
                        <p>
                          {targetTypeLabel(report.target_type, isEnglish)} #{report.target_id}
                          {report.target_summary?.title ? ` - ${report.target_summary.title}` : ''}
                        </p>
                        {report.target_summary?.owner_name ? (
                          <p className="text-muted-foreground">
                            {isEnglish ? 'Owner' : 'المالك'}: {report.target_summary.owner_name}
                          </p>
                        ) : null}
                        {report.target_summary?.status ? (
                          <p className="text-muted-foreground">
                            {isEnglish ? 'Status' : 'الحالة'}: {report.target_summary.status}
                          </p>
                        ) : null}
                        {report.target_summary?.amount ? (
                          <p className="text-muted-foreground">
                            {isEnglish ? 'Amount' : 'المبلغ'}:{' '}
                            {formatAmount(report.target_summary.amount, isEnglish)}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">{isEnglish ? 'Related contract' : 'العقد المرتبط'}</p>
                        {report.contract_summary ? (
                          <>
                            <p>
                              #{report.contract_summary.id}
                              {report.contract_summary.subject_title
                                ? ` - ${report.contract_summary.subject_title}`
                                : ''}
                            </p>
                            <p className="text-muted-foreground">
                              {isEnglish ? 'Amount' : 'المبلغ'}:{' '}
                              {formatAmount(report.contract_summary.amount, isEnglish)}
                            </p>
                            <p className="text-muted-foreground">
                              {isEnglish ? 'Status' : 'الحالة'}: {report.contract_summary.status}
                            </p>
                            <p className="text-muted-foreground">
                              {isEnglish ? 'Client' : 'العميل'}:{' '}
                              {report.contract_summary.client_name || (isEnglish ? 'Unknown' : 'غير معروف')}
                            </p>
                            <p className="text-muted-foreground">
                              {isEnglish ? 'Provider' : 'مقدم الخدمة'}:{' '}
                              {report.contract_summary.freelancer_name ||
                                (isEnglish ? 'Unknown' : 'غير معروف')}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted-foreground">
                            {report.contract_id || (isEnglish ? 'Not linked' : 'غير مرتبط')}
                          </p>
                        )}
                      </div>

                      <p className="lg:col-span-2">
                        {isEnglish ? 'Reporter role' : 'دور المبلغ'}:{' '}
                        <span className="font-medium text-foreground">
                          {report.reporter?.role || (isEnglish ? 'Unknown' : 'غير معروف')}
                        </span>
                      </p>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {report.description}
                    </p>

                    {report.attachments?.length ? (
                      <div className="rounded-md border p-3 text-sm">
                        <p className="mb-2 font-medium">{isEnglish ? 'Attachments' : 'المرفقات'}</p>
                        <div className="flex flex-wrap gap-2">
                          {report.attachments.map((attachment, index) => {
                            const label = getAttachmentLabel(attachment);

                            return isProbablyFileReference(attachment) ? (
                              <a
                                key={`${report.id}-${label}-${index}`}
                                className="rounded-md border px-3 py-1 text-primary hover:bg-primary/5"
                                href={getAttachmentUrl(attachment)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {label}
                              </a>
                            ) : (
                              <span
                                key={`${report.id}-${label}-${index}`}
                                className="rounded-md border px-3 py-1 text-muted-foreground"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {report.admin_decision ? (
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <p className="mb-1 font-medium">{isEnglish ? 'Admin decision' : 'قرار الأدمن'}</p>
                        <p>{report.admin_decision}</p>
                      </div>
                    ) : null}

                    {report.status === 'pending' ? (
                      <div className="space-y-3">
                        <Textarea
                          rows={3}
                          placeholder={isEnglish ? 'Admin decision note' : 'ملاحظة قرار الإدارة'}
                          value={decisionNotes[report.id] || ''}
                          onChange={(event) =>
                            setDecisionNotes((current) => ({
                              ...current,
                              [report.id]: event.target.value,
                            }))
                          }
                        />

                        {report.contract_id ? (
                          <Select
                            value={adminActions[report.id] || 'none'}
                            onValueChange={(value) =>
                              setAdminActions((current) => ({
                                ...current,
                                [report.id]: value as AdminAction,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                {isEnglish ? 'No financial action' : 'بدون إجراء مالي'}
                              </SelectItem>
                              <SelectItem value="refund_client">
                                {isEnglish ? 'Refund client' : 'إرجاع المبلغ للعميل'}
                              </SelectItem>
                              <SelectItem value="release_freelancer">
                                {isEnglish ? 'Release to provider' : 'تحرير المبلغ لمقدم الخدمة'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : null}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            disabled={busyId === report.id}
                            onClick={() => void decide(report, 'accepted')}
                          >
                            {busyId === report.id ? (
                              <LoaderCircle className="me-2 size-4 animate-spin" />
                            ) : null}
                            {isEnglish ? 'Accept' : 'قبول'}
                          </Button>
                          <Button
                            variant="outline"
                            disabled={busyId === report.id}
                            onClick={() => void decide(report, 'rejected')}
                          >
                            {isEnglish ? 'Reject' : 'رفض'}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
