import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react';
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
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import { getAllReports, Report, updateReportDecision } from '@/app/api/endpoints';

type Status = { type: 'success' | 'error'; message: string } | null;

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

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'جديد', en: 'Pending' },
    accepted: { ar: 'مقبول', en: 'Accepted' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function statusClasses(status: string) {
  if (status === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
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

export default function AdminReports() {
  const { language, isEnglish } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [decisionNotes, setDecisionNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      setReports(await getAllReports());
    } catch (error) {
      setReports([]);
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not load reports.' : 'تعذر تحميل البلاغات'),
      });
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const decide = async (report: Report, decision: 'accepted' | 'rejected') => {
    try {
      setBusyId(report.id);
      setStatus(null);
      const updated = await updateReportDecision(report.id, {
        status: decision,
        admin_decision: decisionNotes[report.id]?.trim() || null,
      });
      setReports((current) => current.map((item) => (item.id === report.id ? updated : item)));
      setStatus({
        type: 'success',
        message: isEnglish
          ? 'Report status updated successfully.'
          : 'تم تحديث حالة الطلب بنجاح',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not update report status.' : 'تعذر تحديث حالة الطلب'),
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
              {isEnglish ? 'Reports Center' : 'مركز التقارير'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Real reports submitted through the backend reports system.'
                : 'بلاغات حقيقية مرسلة عبر نظام التقارير في الباك.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadReports()}>
            <RefreshCw className="me-2 size-4" />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        <StatusMessage status={status} />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Pending' : 'جديدة'}</p>
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
                ? 'Support tickets appear here together with complaints and disputes.'
                : 'تظهر طلبات الدعم هنا مع الشكاوى والنزاعات.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <LoaderCircle className="size-8 animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'No reports currently.' : 'لا توجد بلاغات حالياً.'}
              </div>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{report.title || `#${report.id}`}</CardTitle>
                        <CardDescription>
                          {report.reporter?.name || (isEnglish ? 'Unknown user' : 'مستخدم غير معروف')} -{' '}
                          {formatDate(report.created_at, isEnglish)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {categoryLabel(report.category, isEnglish)}
                        </Badge>
                        <Badge className={statusClasses(report.status)}>
                          {statusLabel(report.status, isEnglish)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    {report.admin_decision ? (
                      <p className="rounded-md bg-muted p-3 text-sm">{report.admin_decision}</p>
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
