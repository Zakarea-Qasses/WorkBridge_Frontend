import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import JobApplicationsList from '@/app/components/job-applications/JobApplicationsList';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui';
import {
  acceptProjectApplication,
  getMyProjectApplications,
  getMyServiceRequests,
  getReceivedProjectApplications,
  rejectProjectApplication,
  type ProjectApplication,
  type ServiceRequest,
} from '@/app/api/endpoints';
import { getApiErrorMessage } from '@/app/api/client';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { formatUsd } from '@/app/utils/money';
import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

function statusLabel(status: ApplicationStatus, isEnglish: boolean) {
  const labels: Record<ApplicationStatus, [string, string]> = {
    pending: ['Pending', 'قيد الانتظار'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status;
}

function statusClasses(status: ApplicationStatus) {
  if (status === 'accepted') return 'border-green-200 bg-green-50 text-green-700';
  if (status === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

function formatDays(days: number | string, isEnglish: boolean) {
  return `${days} ${isEnglish ? 'days' : 'يوم'}`;
}

function ErrorCard({
  message,
  onRetry,
  isEnglish,
}: {
  message: string;
  onRetry: () => void;
  isEnglish: boolean;
}) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center text-sm text-destructive">
        <AlertCircle className="size-6" />
        <p>{message}</p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="me-2 size-4" />
          {isEnglish ? 'Retry' : 'إعادة المحاولة'}
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-muted-foreground">{text}</CardContent>
    </Card>
  );
}

function ProjectApplicationCard({
  application,
  isEnglish,
  mode,
  processingId,
  onAccept,
  onReject,
}: {
  application: ProjectApplication;
  isEnglish: boolean;
  mode: 'received' | 'sent';
  processingId: number | null;
  onAccept?: (application: ProjectApplication) => void;
  onReject?: (application: ProjectApplication) => void;
}) {
  const isProcessing = processingId === application.id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {application.project?.title || (isEnglish ? 'Project' : 'مشروع')}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'received'
                ? `${isEnglish ? 'Applicant:' : 'المتقدم:'} ${application.user?.name || '-'}`
                : isEnglish
                  ? 'Your submitted offer'
                  : 'العرض الذي أرسلته'}
            </p>
          </div>
          <Badge variant="outline" className={statusClasses(application.status)}>
            {statusLabel(application.status, isEnglish)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground">{isEnglish ? 'Offer value' : 'قيمة العرض'}</p>
            <p className="mt-1 font-semibold">
              {formatUsd(application.price, isEnglish ? 'en' : 'ar')}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-muted-foreground">{isEnglish ? 'Duration' : 'مدة التنفيذ'}</p>
            <p className="mt-1 font-semibold">
              {formatDays(application.duration_days, isEnglish)}
            </p>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {application.description}
        </p>

        {mode === 'received' && application.status === 'pending' ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={isProcessing} onClick={() => onAccept?.(application)}>
              <CheckCircle2 className="me-2 size-4" />
              {isEnglish ? 'Accept offer' : 'قبول العرض'}
            </Button>
            <Button variant="outline" disabled={isProcessing} onClick={() => onReject?.(application)}>
              <XCircle className="me-2 size-4" />
              {isEnglish ? 'Reject offer' : 'رفض العرض'}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function Applications() {
  const { isEnglish, language } = useLanguage();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [sentProjectApplications, setSentProjectApplications] = useState<ProjectApplication[]>([]);
  const [receivedProjectApplications, setReceivedProjectApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [serviceResponse, sentProjectsResponse, receivedProjectsResponse] = await Promise.all([
        getMyServiceRequests(),
        getMyProjectApplications(),
        getReceivedProjectApplications(),
      ]);

      setServiceRequests(serviceResponse);
      setSentProjectApplications(sentProjectsResponse.data);
      setReceivedProjectApplications(receivedProjectsResponse.data);
    } catch (requestError) {
      setServiceRequests([]);
      setSentProjectApplications([]);
      setReceivedProjectApplications([]);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleProjectDecision = async (
    application: ProjectApplication,
    decision: 'accept' | 'reject',
  ) => {
    try {
      setProcessingId(application.id);
      setError('');
      setActionMessage('');
      if (decision === 'accept') {
        await acceptProjectApplication(application.id);
        setActionMessage(isEnglish ? 'Offer accepted successfully.' : 'تم قبول العرض بنجاح.');
      } else {
        await rejectProjectApplication(application.id);
        setActionMessage(isEnglish ? 'Offer rejected.' : 'تم رفض العرض.');
      }
      await loadApplications();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setProcessingId(null);
    }
  };

  const latestReceived = useMemo(
    () => receivedProjectApplications,
    [receivedProjectApplications],
  );

  return (
    <DashboardLayout>
      <div className="space-y-8" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Applications' : 'التقديمات'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Track your project offers, job applications, and service requests.'
                : 'تابع عروض المشاريع وتقديمات الوظائف وطلبات الخدمات من مكان واحد.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadApplications()}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </div>

        {actionMessage ? (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="size-4" />
            {actionMessage}
          </div>
        ) : null}

        {error ? (
          <ErrorCard message={error} onRetry={() => void loadApplications()} isEnglish={isEnglish} />
        ) : null}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isEnglish ? 'Offers on My Projects' : 'العروض الواردة على مشاريعي'}
          </h2>

          {loading ? (
            <div className="h-48 animate-pulse rounded-md bg-muted" />
          ) : latestReceived.length === 0 ? (
            <EmptyCard
              text={
                isEnglish
                  ? 'No offers have been submitted to your projects yet.'
                  : 'لا توجد عروض واردة على مشاريعك حتى الآن.'
              }
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {latestReceived.map((application) => (
                <ProjectApplicationCard
                  key={application.id}
                  application={application}
                  isEnglish={isEnglish}
                  mode="received"
                  processingId={processingId}
                  onAccept={(item) => void handleProjectDecision(item, 'accept')}
                  onReject={(item) => void handleProjectDecision(item, 'reject')}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isEnglish ? 'My Project Offers' : 'تقديماتي على المشاريع'}
          </h2>

          {loading ? (
            <div className="h-48 animate-pulse rounded-md bg-muted" />
          ) : sentProjectApplications.length === 0 ? (
            <EmptyCard
              text={
                isEnglish
                  ? 'You have not submitted offers to projects yet.'
                  : 'لم ترسل أي عرض على مشروع حتى الآن.'
              }
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {sentProjectApplications.map((application) => (
                <ProjectApplicationCard
                  key={application.id}
                  application={application}
                  isEnglish={isEnglish}
                  mode="sent"
                  processingId={processingId}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isEnglish ? 'Job Applications' : 'التقديمات على الوظائف'}
          </h2>
          <JobApplicationsList isEnglish={isEnglish} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isEnglish ? 'Service Requests' : 'طلبات الخدمات'}
          </h2>

          {loading ? (
            <div className="h-40 animate-pulse rounded-md bg-muted" />
          ) : serviceRequests.length === 0 ? (
            <EmptyCard
              text={
                isEnglish
                  ? 'No service requests have been sent yet.'
                  : 'لا توجد طلبات خدمات مرسلة حتى الآن.'
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {serviceRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        {request.service?.title ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {request.service.title}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline" className={statusClasses(request.status)}>
                        {statusLabel(request.status, isEnglish)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {formatDays(request.delivery_days, isEnglish)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
