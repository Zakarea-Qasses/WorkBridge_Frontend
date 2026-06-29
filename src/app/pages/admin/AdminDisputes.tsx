import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import { getAllReports, Report, ReportDecisionPayload, updateReportDecision } from '@/app/api/endpoints';

type StatusMessage = { type: 'success' | 'error'; message: string } | null;
type AdminAction = NonNullable<ReportDecisionPayload['admin_action']> | 'none';

function formatAmount(value: number | string | null | undefined, isEnglish: boolean) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return isEnglish ? 'Unavailable' : 'غير متوفر';
  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar', { maximumFractionDigits: 2 }).format(amount);
}

function formatDate(value: string | undefined, isEnglish: boolean) {
  if (!value) return isEnglish ? 'Unavailable' : 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    pending: ['Pending', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };
  return labels[status]?.[isEnglish ? 0 : 1] || status.replaceAll('_', ' ');
}

function statusClass(status: string) {
  if (status === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-amber-100 text-amber-800 border-amber-200';
}

function isDisputeReport(report: Report) {
  return Boolean(report.contract_id || report.target_type === 'contract' || ['dispute', 'payment'].includes(report.category));
}

export default function AdminDisputes() {
  const { language, isEnglish } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<Record<number, string>>({});
  const [adminActions, setAdminActions] = useState<Record<number, AdminAction>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const items = (await getAllReports()).filter(isDisputeReport);
      setReports(items);
      setSelectedId((current) => current || items.find((item) => item.status === 'pending')?.id || items[0]?.id || null);
    } catch (error) {
      setReports([]);
      setSelectedId(null);
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDisputes();
  }, [loadDisputes]);

  const pendingDisputes = useMemo(
    () => reports.filter((report) => report.status === 'pending'),
    [reports],
  );

  const resolvedDisputes = useMemo(
    () => reports.filter((report) => report.status !== 'pending'),
    [reports],
  );

  const selectedReport = reports.find((report) => report.id === selectedId) || pendingDisputes[0] || reports[0] || null;

  const decide = async (report: Report, decision: 'accepted' | 'rejected') => {
    try {
      setBusyId(report.id);
      setStatus(null);
      const action = adminActions[report.id] || 'none';
      const payload: ReportDecisionPayload = {
        status: decision,
        admin_decision: decisionNotes[report.id]?.trim() || null,
      };

      if (decision === 'accepted' && report.contract_id && action !== 'none') {
        payload.admin_action = action;
      }

      const updated = await updateReportDecision(report.id, payload);
      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, ...updated, reporter: updated.reporter || item.reporter } : item,
        ),
      );
      setStatus({
        type: 'success',
        message: isEnglish ? 'Dispute decision saved.' : 'تم حفظ قرار النزاع.',
      });
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Complaints and Disputes' : 'الشكاوى والنزاعات'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Real contract disputes and payment reports from the backend.'
                : 'نزاعات العقود وبلاغات الدفع الحقيقية من الباك.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadDisputes()}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        {status ? (
          <Card
            className={
              status.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-destructive/30 bg-destructive/5'
            }
          >
            <CardContent
              className={
                status.type === 'success'
                  ? 'flex items-center gap-2 pt-6 text-sm text-green-700'
                  : 'flex items-center gap-2 pt-6 text-sm text-destructive'
              }
            >
              {status.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
              {status.message}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Pending' : 'قيد المراجعة'}</p>
              <p className="mt-1 text-3xl font-bold">{pendingDisputes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Resolved' : 'تمت معالجتها'}</p>
              <p className="mt-1 text-3xl font-bold">{resolvedDisputes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Total' : 'الإجمالي'}</p>
              <p className="mt-1 text-3xl font-bold">{reports.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Open disputes' : 'النزاعات المفتوحة'}</CardTitle>
              <CardDescription>
                {isEnglish ? 'Select a dispute to review and decide.' : 'اختر نزاعا لمراجعته واتخاذ القرار.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="h-48 animate-pulse rounded-md bg-muted" />
              ) : pendingDisputes.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'No open disputes currently.' : 'لا توجد نزاعات مفتوحة حاليا.'}
                </div>
              ) : (
                pendingDisputes.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedId(report.id)}
                    className={`w-full rounded-lg border p-4 text-start transition-colors hover:bg-accent ${
                      selectedReport?.id === report.id ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 font-semibold">
                          {report.title || report.contract_summary?.subject_title || report.description}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {report.contract_summary?.client_name || '-'} /{' '}
                          {report.contract_summary?.freelancer_name || '-'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatAmount(report.contract_summary?.amount || report.target_summary?.amount, isEnglish)}
                          {' - '}
                          {formatDate(report.created_at, isEnglish)}
                        </p>
                      </div>
                      <Badge className={statusClass(report.status)}>{statusLabel(report.status, isEnglish)}</Badge>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Final decision' : 'القرار النهائي'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Accept or reject the dispute. Contract disputes can include a financial action.'
                  : 'اقبل أو ارفض النزاع. نزاعات العقود يمكن أن تتضمن إجراء ماليا.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedReport ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'Select a dispute first.' : 'اختر نزاعا أولا.'}
                </div>
              ) : (
                <>
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                    <h3 className="font-semibold">{selectedReport.title || `#${selectedReport.id}`}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{selectedReport.description}</p>
                    <div className="mt-3 space-y-1 text-muted-foreground">
                      <p>
                        {isEnglish ? 'Reporter' : 'المبلغ'}:{' '}
                        {selectedReport.reporter?.name || '-'}
                      </p>
                      <p>
                        {isEnglish ? 'Contract' : 'العقد'}:{' '}
                        {selectedReport.contract_summary?.id || selectedReport.contract_id || '-'}
                      </p>
                      <p>
                        {isEnglish ? 'Amount' : 'المبلغ'}:{' '}
                        {formatAmount(
                          selectedReport.contract_summary?.amount || selectedReport.target_summary?.amount,
                          isEnglish,
                        )}
                      </p>
                      <p>
                        {isEnglish ? 'Client' : 'العميل'}:{' '}
                        {selectedReport.contract_summary?.client_name || '-'}
                      </p>
                      <p>
                        {isEnglish ? 'Provider' : 'مقدم الخدمة'}:{' '}
                        {selectedReport.contract_summary?.freelancer_name || '-'}
                      </p>
                    </div>
                  </div>

                  {selectedReport.status === 'pending' ? (
                    <>
                      <Textarea
                        rows={4}
                        placeholder={isEnglish ? 'Decision note' : 'ملاحظة القرار'}
                        value={decisionNotes[selectedReport.id] || ''}
                        onChange={(event) =>
                          setDecisionNotes((current) => ({
                            ...current,
                            [selectedReport.id]: event.target.value,
                          }))
                        }
                      />

                      {selectedReport.contract_id ? (
                        <Select
                          value={adminActions[selectedReport.id] || 'none'}
                          onValueChange={(value) =>
                            setAdminActions((current) => ({
                              ...current,
                              [selectedReport.id]: value as AdminAction,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{isEnglish ? 'No financial action' : 'بدون إجراء مالي'}</SelectItem>
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
                          disabled={busyId === selectedReport.id}
                          onClick={() => void decide(selectedReport, 'accepted')}
                        >
                          {busyId === selectedReport.id ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                          {isEnglish ? 'Accept dispute' : 'قبول النزاع'}
                        </Button>
                        <Button
                          variant="outline"
                          disabled={busyId === selectedReport.id}
                          onClick={() => void decide(selectedReport, 'rejected')}
                        >
                          {isEnglish ? 'Reject dispute' : 'رفض النزاع'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">{statusLabel(selectedReport.status, isEnglish)}</p>
                      <p className="mt-1 text-muted-foreground">
                        {selectedReport.admin_decision || (isEnglish ? 'No decision note.' : 'لا توجد ملاحظة قرار.')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {resolvedDisputes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Resolved disputes' : 'النزاعات المعالجة'}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resolvedDisputes.map((report) => (
                <div key={report.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-2 font-semibold">
                        {report.title || report.contract_summary?.subject_title || `#${report.id}`}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(report.updated_at, isEnglish)}
                      </p>
                    </div>
                    <Badge className={statusClass(report.status)}>{statusLabel(report.status, isEnglish)}</Badge>
                  </div>
                  {report.admin_decision ? (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{report.admin_decision}</p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
