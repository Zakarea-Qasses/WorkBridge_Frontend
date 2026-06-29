import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, Paperclip, RefreshCw, X } from 'lucide-react';
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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  createReport,
  getMyReports,
  Report,
  ReportAttachment,
  ReportCategory,
  ReportPriority,
} from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';

interface SupportForm {
  title: string;
  description: string;
  category: ReportCategory;
  priority: ReportPriority;
  attachments: File[];
}

type Status = {
  type: 'success' | 'error';
  message: string;
} | null;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const initialForm: SupportForm = {
  title: '',
  description: '',
  category: 'support',
  priority: 'normal',
  attachments: [],
};

function attachmentLabel(attachment: ReportAttachment) {
  if (typeof attachment === 'string') {
    return attachment.split('/').filter(Boolean).pop() || attachment;
  }

  return attachment.name || attachment.path || attachment.url || 'Attachment';
}

function attachmentUrl(attachment: ReportAttachment) {
  const value = typeof attachment === 'string' ? attachment : attachment.url || attachment.path || '';
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  const normalized = value.replace(/^\/+/, '');
  const storagePath = normalized.startsWith('storage/') ? normalized : `storage/${normalized}`;
  return `${BACKEND_BASE_URL}/${storagePath}`;
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

function categoryClasses(category: string) {
  if (category === 'dispute') return 'bg-red-100 text-red-700 border-red-200';
  if (category === 'complaint') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (category === 'payment') return 'bg-green-100 text-green-700 border-green-200';
  if (category === 'technical') return 'bg-purple-100 text-purple-700 border-purple-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function priorityLabel(priority: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    low: { ar: 'منخفضة', en: 'Low' },
    normal: { ar: 'عادية', en: 'Normal' },
    high: { ar: 'مرتفعة', en: 'High' },
  };

  return isEnglish ? labels[priority]?.en || priority : labels[priority]?.ar || priority;
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'جديد', en: 'Pending' },
    accepted: { ar: 'تم القبول', en: 'Accepted' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function statusClasses(status: string) {
  if (status === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function statusText(report: Report, isEnglish: boolean) {
  if (report.admin_decision) {
    return report.admin_decision;
  }

  if (report.status === 'accepted') {
    return isEnglish ? 'Your request was accepted by the admin team.' : 'تم قبول طلبك من قبل الإدارة.';
  }

  if (report.status === 'rejected') {
    return isEnglish ? 'Your request was rejected by the admin team.' : 'تم رفض طلبك من قبل الإدارة.';
  }

  return isEnglish
    ? 'The request is waiting for admin review.'
    : 'الطلب بانتظار مراجعة الإدارة.';
}

function formatDate(value: string, isEnglish: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Date unavailable' : 'التاريخ غير متاح';

  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function StatusMessage({ status }: { status: Status }) {
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

export default function SupportCenter() {
  const { isEnglish, language } = useLanguage();
  const { user } = useAuth();
  const requestIdRef = useRef(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState<SupportForm>(initialForm);

  const latestReport = useMemo(() => reports[0], [reports]);

  const loadReports = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setStatus(null);
    setReports([]);

    try {
      const response = await getMyReports(page);
      if (requestId !== requestIdRef.current) return;
      setReports(response.data);
      setLastPage(response.last_page || 1);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setReports([]);
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not load support requests.' : 'تعذر تحميل طلبات الدعم'),
      });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [isEnglish, page]);

  useEffect(() => {
    setReports([]);
    setPage(1);
    setLastPage(1);
    setFieldErrors({});
    setForm(initialForm);
  }, [user?.id]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const updateForm = <K extends keyof SupportForm>(key: K, value: SupportForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: [] }));
  };

  const addAttachments = (files: FileList | null) => {
    const nextFiles = Array.from(files || []);
    if (!nextFiles.length) return;

    setForm((current) => ({
      ...current,
      attachments: [...current.attachments, ...nextFiles],
    }));
    setFieldErrors((current) => ({ ...current, attachments: [] }));
  };

  const removeAttachment = (index: number) => {
    setForm((current) => ({
      ...current,
      attachments: current.attachments.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setStatus(null);
      setFieldErrors({});
      await createReport({
        target_type: 'general',
        title: form.title.trim() || null,
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        attachments: form.attachments.length ? form.attachments : null,
      });
      setForm(initialForm);
      setStatus({
        type: 'success',
        message: isEnglish
          ? 'Support request sent successfully.'
          : 'تم إرسال طلب الدعم بنجاح',
      });
      setPage(1);
      await loadReports();
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not send support request.' : 'تعذر إرسال طلب الدعم'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Support Center' : 'مركز الدعم'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Send a real support request and track the admin review status from this page.'
              : 'أرسل طلب دعم حقيقي وتابع حالة مراجعته من الإدارة من نفس الصفحة.'}
          </p>
        </div>

        <StatusMessage status={status} />

        {latestReport ? (
          <Card className="border-amber-200 bg-amber-50/60">
            <CardHeader>
              <CardTitle>{isEnglish ? 'Latest Update on Your Request' : 'آخر تحديث على طلبك'}</CardTitle>
              <CardDescription>{latestReport.title || `#${latestReport.id}`}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge className={statusClasses(latestReport.status)}>
                  {statusLabel(latestReport.status, isEnglish)}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {statusText(latestReport, isEnglish)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(latestReport.updated_at || latestReport.created_at, isEnglish)}
              </span>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Create New Ticket' : 'إنشاء تذكرة جديدة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'The request is submitted to the backend reports system.'
                  : 'يتم إرسال الطلب إلى نظام البلاغات الحقيقي في الباك.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="support-title">{isEnglish ? 'Title' : 'العنوان'}</Label>
                  <Input
                    id="support-title"
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                  />
                  {fieldErrors.title?.[0] ? (
                    <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{isEnglish ? 'Category' : 'التصنيف'}</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => updateForm('category', value as ReportCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['support', 'complaint', 'dispute', 'payment', 'technical'] as const).map(
                          (category) => (
                            <SelectItem key={category} value={category}>
                              {categoryLabel(category, isEnglish)}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.category?.[0] ? (
                      <p className="text-xs text-destructive">{fieldErrors.category[0]}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label>{isEnglish ? 'Priority' : 'الأولوية'}</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(value) => updateForm('priority', value as ReportPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['low', 'normal', 'high'] as const).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priorityLabel(priority, isEnglish)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.priority?.[0] ? (
                      <p className="text-xs text-destructive">{fieldErrors.priority[0]}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-description">{isEnglish ? 'Description' : 'الوصف'}</Label>
                  <Textarea
                    id="support-description"
                    rows={6}
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                  />
                  {fieldErrors.description?.[0] ? (
                    <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-attachments">
                    {isEnglish ? 'Attachments' : 'المرفقات'}
                  </Label>
                  <Input
                    id="support-attachments"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                    onChange={(event) => {
                      addAttachments(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isEnglish
                      ? 'You can upload images, documents, spreadsheets, zip files, or text files up to 10 MB each.'
                      : 'يمكنك رفع صور أو مستندات أو جداول أو ملفات مضغوطة أو نصية، حتى 10 ميغابايت لكل ملف.'}
                  </p>
                  {form.attachments.length ? (
                    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                      {form.attachments.map((file, index) => (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Paperclip className="size-4 text-primary" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({Math.ceil(file.size / 1024)} KB)
                            </span>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="me-1 size-4" />
                            {isEnglish ? 'Remove' : 'إزالة'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {fieldErrors.attachments?.[0] ? (
                    <p className="text-xs text-destructive">{fieldErrors.attachments[0]}</p>
                  ) : null}
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                  {isEnglish ? 'Send Ticket' : 'إرسال التذكرة'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{isEnglish ? 'Your Tickets History' : 'سجل تذاكرك'}</CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'These requests come from GET /reports/my.'
                      : 'هذه الطلبات محملة من GET /reports/my.'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled={loading} onClick={() => void loadReports()}>
                  <RefreshCw className="me-2 size-4" />
                  {isEnglish ? 'Retry' : 'إعادة المحاولة'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-32 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : reports.length === 0 && !status ? (
                <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'No support requests yet.' : 'لا توجد طلبات دعم حتى الآن'}
                </div>
              ) : null}

              {!loading
                ? reports.map((report) => (
                    <div key={report.id} className="space-y-3 rounded-md border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{report.title || `#${report.id}`}</h3>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={categoryClasses(report.category)}>
                            {categoryLabel(report.category, isEnglish)}
                          </Badge>
                          <Badge variant="outline">
                            {priorityLabel(report.priority, isEnglish)}
                          </Badge>
                          <Badge className={statusClasses(report.status)}>
                            {statusLabel(report.status, isEnglish)}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{statusText(report, isEnglish)}</p>

                      {report.attachments?.length ? (
                        <div className="rounded-md bg-muted/40 p-3 text-sm">
                          <p className="mb-2 font-medium">{isEnglish ? 'Attachments' : 'المرفقات'}</p>
                          <div className="flex flex-wrap gap-2">
                            {report.attachments.map((attachment, index) => {
                              const label = attachmentLabel(attachment);
                              const url = attachmentUrl(attachment);

                              return url ? (
                                <a
                                  key={`${report.id}-${label}-${index}`}
                                  className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-primary hover:bg-primary/5"
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Paperclip className="size-4" />
                                  {label}
                                </a>
                              ) : (
                                <span
                                  key={`${report.id}-${label}-${index}`}
                                  className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-muted-foreground"
                                >
                                  <Paperclip className="size-4" />
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {isEnglish ? 'No attachments.' : 'لا توجد مرفقات'}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground">
                        #{report.id} - {formatDate(report.created_at, isEnglish)}
                      </div>
                    </div>
                  ))
                : null}

              {lastPage > 1 ? (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    disabled={page === 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    {isEnglish ? 'Previous' : 'السابق'}
                  </Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">
                    {page} / {lastPage}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === lastPage || loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {isEnglish ? 'Next' : 'التالي'}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
