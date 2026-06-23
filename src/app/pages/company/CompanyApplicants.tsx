import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoaderCircle, MessageSquare, RefreshCw, Users } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getCompanyJobs,
  getJobApplications,
  startConversation,
  updateJobApplicationStatus,
  type JobApplication,
  type JobApplicationStatus,
} from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';

type ApplicationWithJobTitle = JobApplication & { jobTitle: string };

function statusLabel(status: JobApplicationStatus, isEnglish: boolean) {
  const labels: Record<JobApplicationStatus, [string, string]> = {
    pending: ['Pending', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };
  return labels[status][isEnglish ? 0 : 1];
}

function statusClasses(status: JobApplicationStatus) {
  if (status === 'accepted') return 'border-green-200 bg-green-50 text-green-700';
  if (status === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

export default function CompanyApplicants() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithJobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const jobs = await getCompanyJobs();
      const results = await Promise.all(
        jobs.map(async (job) =>
          (await getJobApplications(job.id)).map((application) => ({
            ...application,
            jobTitle: job.title,
          })),
        ),
      );
      setApplications(
        results.flat().sort(
          (first, second) =>
            new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
        ),
      );
    } catch (requestError) {
      setApplications([]);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (
    application: ApplicationWithJobTitle,
    status: JobApplicationStatus,
  ) => {
    try {
      setBusyId(application.id);
      setError('');
      const updated = await updateJobApplicationStatus(application.id, status);
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, ...updated } : item,
        ),
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const openConversation = async (application: ApplicationWithJobTitle) => {
    if (!application.user?.id) return;
    try {
      setBusyId(application.id);
      setError('');
      const conversation = await startConversation(application.user.id);
      navigate(`/company/messages?conversation=${conversation.id}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Job Applicants' : 'المتقدمون للوظائف'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Review real applicants and contact them directly.'
                : 'راجع المتقدمين الحقيقيين وتواصل معهم مباشرة.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void load()}>
            <RefreshCw className="me-2 size-4" />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Users className="size-10" />
              <p>{isEnglish ? 'No job applications yet.' : 'لا توجد تقديمات على الوظائف حتى الآن.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>{application.user?.name || (isEnglish ? 'Applicant' : 'متقدم')}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{application.jobTitle}</p>
                      {application.user?.profile?.job_title ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {application.user.profile.job_title}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline" className={statusClasses(application.status)}>
                      {statusLabel(application.status, isEnglish)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === application.id || application.status === 'accepted'}
                    onClick={() => void updateStatus(application, 'accepted')}
                  >
                    {busyId === application.id ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                    {isEnglish ? 'Accept' : 'قبول'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === application.id || !application.user?.id}
                    onClick={() => void openConversation(application)}
                  >
                    <MessageSquare className="me-2 size-4" />
                    {isEnglish ? 'Message' : 'مراسلة'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busyId === application.id || application.status === 'rejected'}
                    onClick={() => void updateStatus(application, 'rejected')}
                  >
                    {isEnglish ? 'Reject' : 'رفض'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
