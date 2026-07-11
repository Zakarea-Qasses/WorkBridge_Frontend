import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { ApiError, getApiErrorMessage } from '@/app/api/client';
import {
  getCompanyJobsPage,
  getJobApplications,
  startConversation,
  updateJobApplicationStatus,
  type JobApplication,
  type JobApplicationStatus,
  type JobPost,
} from '@/app/api/endpoints';
import { getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

type JobFilterValue = 'all' | string;
type StatusFilterValue = 'all' | JobApplicationStatus;
type ApplicationWithJobTitle = JobApplication & {
  jobTitle: string;
  jobId: number;
};

const finalStatuses: JobApplicationStatus[] = ['accepted', 'rejected'];

function statusLabel(status: JobApplicationStatus, isEnglish: boolean) {
  const labels: Record<JobApplicationStatus, [string, string]> = {
    pending: ['Pending', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };
  return labels[status][isEnglish ? 0 : 1];
}

function statusClasses(status: JobApplicationStatus) {
  if (status === 'accepted') {
    return 'border-green-200 bg-green-50 text-green-700';
  }
  if (status === 'rejected') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

function formatDate(value: string | undefined, isEnglish: boolean) {
  if (!value) {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getCompanyApplicantsErrorMessage(error: unknown, isEnglish: boolean) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return isEnglish
        ? 'You are not allowed to view applicants for this job.'
        : 'ليس لديك صلاحية لعرض متقدمي هذه الوظيفة.';
    }
    if (error.status === 404) {
      return isEnglish
        ? 'The job or application was not found.'
        : 'الوظيفة أو طلب التقديم غير موجود.';
    }
    if (error.status >= 500) {
      return isEnglish
        ? 'Could not load company applicants right now.'
        : 'تعذر تحميل متقدمي وظائف الشركة حالياً.';
    }
  }

  return getApiErrorMessage(error);
}

async function getAllCompanyJobs() {
  const firstPage = await getCompanyJobsPage(1);
  const jobs = [...firstPage.data];

  for (let page = 2; page <= firstPage.last_page; page += 1) {
    const nextPage = await getCompanyJobsPage(page);
    jobs.push(...nextPage.data);
  }

  return jobs;
}

export default function CompanyApplicants() {
  const { language, isEnglish } = useLanguage();
  const { user, initializing, isCompany } = useAuth();
  const navigate = useNavigate();
  const requestIdRef = useRef(0);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<ApplicationWithJobTitle[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<JobFilterValue>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const labels = useMemo(
    () => ({
      title: isEnglish ? 'Job Applicants' : 'متقدمو الوظائف',
      subtitle: isEnglish
        ? 'Review real applicants for your company jobs and update their status.'
        : 'راجع المتقدمين لوظائف شركتك وحدّث حالة كل طلب.',
      refresh: isEnglish ? 'Refresh' : 'تحديث',
      allJobs: isEnglish ? 'All jobs' : 'كل الوظائف',
      allStatuses: isEnglish ? 'All statuses' : 'كل الحالات',
      jobFilter: isEnglish ? 'Filter by job' : 'فلترة حسب الوظيفة',
      statusFilter: isEnglish ? 'Filter by status' : 'فلترة حسب الحالة',
      applicantsCount: isEnglish ? 'Applicants' : 'عدد المتقدمين',
      noJobsTitle: isEnglish ? 'No company jobs yet' : 'لا توجد وظائف للشركة حتى الآن',
      noJobsText: isEnglish
        ? 'Create a job first, then applicants will appear here.'
        : 'أنشئ وظيفة أولاً، وبعدها ستظهر طلبات المتقدمين هنا.',
      noApplicationsTitle: isEnglish ? 'No applicants yet' : 'لا توجد تقديمات حتى الآن',
      noApplicationsText: isEnglish
        ? 'When users apply to your jobs, their applications will appear here.'
        : 'عندما يتقدم المستخدمون إلى وظائفك ستظهر طلباتهم هنا.',
      noFilteredText: isEnglish
        ? 'No applications match the selected filters.'
        : 'لا توجد تقديمات مطابقة للفلاتر المحددة.',
      applicant: isEnglish ? 'Applicant' : 'متقدم',
      email: isEnglish ? 'Email' : 'البريد الإلكتروني',
      profileTitle: isEnglish ? 'Profile title' : 'المسمى المهني',
      skills: isEnglish ? 'Skills' : 'المهارات',
      noSkills: isEnglish ? 'No skills added' : 'لم تتم إضافة مهارات',
      submittedAt: isEnglish ? 'Submitted at' : 'تاريخ التقديم',
      accept: isEnglish ? 'Accept' : 'قبول',
      reject: isEnglish ? 'Reject' : 'رفض',
      message: isEnglish ? 'Message' : 'مراسلة',
      acceptedNotice: isEnglish
        ? 'Application accepted. Other applicants for this job were updated.'
        : 'تم قبول الطلب. تم تحديث باقي المتقدمين لهذه الوظيفة.',
      rejectedNotice: isEnglish ? 'Application rejected.' : 'تم رفض الطلب.',
      confirmAccept: isEnglish
        ? 'Accept this applicant? Other applicants for the same job will be rejected.'
        : 'هل تريد قبول هذا المتقدم؟ سيتم رفض باقي المتقدمين لنفس الوظيفة.',
      confirmReject: isEnglish
        ? 'Reject this applicant?'
        : 'هل تريد رفض هذا المتقدم؟',
      unavailable: isEnglish ? 'Not available' : 'غير متوفر',
      finalStatus: isEnglish
        ? 'This application already has a final status.'
        : 'تم تحديد الحالة النهائية لهذا الطلب.',
    }),
    [isEnglish],
  );

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const companyJobs = await getAllCompanyJobs();
      if (requestIdRef.current !== requestId) {
        return;
      }

      const companyId = user?.company?.id;
      const ownedJobs =
        typeof companyId === 'number'
          ? companyJobs.filter((job) => job.company_id === companyId)
          : companyJobs;

      setJobs(ownedJobs);
      if (ownedJobs.length === 0) {
        setApplications([]);
        return;
      }

      const results = await Promise.all(
        ownedJobs.map(async (job) => {
          const jobApplications = await getJobApplications(job.id);
          return jobApplications.map((application) => ({
            ...application,
            jobTitle: job.title,
            jobId: job.id,
          }));
        }),
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      setApplications(
        results.flat().sort((first, second) => {
          return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
        }),
      );
    } catch (requestError) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setJobs([]);
      setApplications([]);
      setError(getCompanyApplicantsErrorMessage(requestError, isEnglish));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [isEnglish, user?.company?.id]);

  useEffect(() => {
    if (!initializing && isCompany) {
      void load();
    }
  }, [initializing, isCompany, load]);

  useEffect(() => {
    if (selectedJobId !== 'all' && jobs.every((job) => String(job.id) !== selectedJobId)) {
      setSelectedJobId('all');
    }
  }, [jobs, selectedJobId]);

  const visibleApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesJob =
        selectedJobId === 'all' || String(application.jobId) === selectedJobId;
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      return matchesJob && matchesStatus;
    });
  }, [applications, selectedJobId, statusFilter]);

  const updateStatus = async (
    application: ApplicationWithJobTitle,
    status: JobApplicationStatus,
  ) => {
    const confirmationMessage = status === 'accepted' ? labels.confirmAccept : labels.confirmReject;
    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setBusyId(application.id);
      setError('');
      setNotice('');
      await updateJobApplicationStatus(application.id, status);
      setNotice(status === 'accepted' ? labels.acceptedNotice : labels.rejectedNotice);
      await load();
    } catch (requestError) {
      setError(getCompanyApplicantsErrorMessage(requestError, isEnglish));
    } finally {
      setBusyId(null);
    }
  };

  const openConversation = async (application: ApplicationWithJobTitle) => {
    if (!application.user?.id) {
      return;
    }

    try {
      setBusyId(application.id);
      setError('');
      setNotice('');
      const conversation = await startConversation(application.user.id);
      navigate(`/company/messages?conversation=${conversation.id}`);
    } catch (requestError) {
      setError(getCompanyApplicantsErrorMessage(requestError, isEnglish));
    } finally {
      setBusyId(null);
    }
  };

  if (initializing) {
    return (
      <DashboardLayout userType="company">
        <div className="flex min-h-96 items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isCompany) {
    return <Navigate to={getDashboardPathForUser(user)} replace />;
  }

  const hasFilters = selectedJobId !== 'all' || statusFilter !== 'all';
  const hasFinalStatus = (status: JobApplicationStatus) => finalStatuses.includes(status);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{labels.title}</h1>
            <p className="mt-1 text-muted-foreground">{labels.subtitle}</p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void load()}>
            {loading ? (
              <LoaderCircle className="me-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="me-2 size-4" />
            )}
            {labels.refresh}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{labels.jobFilter}</p>
            <Select value={selectedJobId} onValueChange={setSelectedJobId} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.allJobs}</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={String(job.id)}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{labels.statusFilter}</p>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.allStatuses}</SelectItem>
                <SelectItem value="pending">{statusLabel('pending', isEnglish)}</SelectItem>
                <SelectItem value="accepted">{statusLabel('accepted', isEnglish)}</SelectItem>
                <SelectItem value="rejected">{statusLabel('rejected', isEnglish)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="flex h-full min-h-20 items-center gap-3 py-4">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{labels.applicantsCount}</p>
                <p className="text-2xl font-semibold">{visibleApplications.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {notice ? (
          <Card className="border-green-200 bg-green-50 text-green-800">
            <CardContent className="flex items-center gap-2 py-3 text-sm">
              <CheckCircle2 className="size-4" />
              {notice}
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="flex items-center gap-2 py-3 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {error}
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <BriefcaseBusiness className="size-10" />
              <div>
                <p className="font-medium text-foreground">{labels.noJobsTitle}</p>
                <p className="mt-1 text-sm">{labels.noJobsText}</p>
              </div>
            </CardContent>
          </Card>
        ) : visibleApplications.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Users className="size-10" />
              <div>
                <p className="font-medium text-foreground">{labels.noApplicationsTitle}</p>
                <p className="mt-1 text-sm">
                  {hasFilters && applications.length > 0
                    ? labels.noFilteredText
                    : labels.noApplicationsText}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {visibleApplications.map((application) => {
              const applicant = application.user;
              const profile = applicant?.profile;
              const skills = profile?.skills || [];
              const isBusy = busyId === application.id;
              const finalStatus = hasFinalStatus(application.status);

              return (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle>{applicant?.name || labels.applicant}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{application.jobTitle}</p>
                      </div>
                      <Badge variant="outline" className={statusClasses(application.status)}>
                        {statusLabel(application.status, isEnglish)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.email}</p>
                        <p className="font-medium">{applicant?.email || labels.unavailable}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.profileTitle}</p>
                        <p className="font-medium">{profile?.job_title || labels.unavailable}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.submittedAt}</p>
                        <p className="font-medium">{formatDate(application.created_at, isEnglish)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{labels.skills}</p>
                        <p className="font-medium">
                          {skills.length > 0
                            ? skills.map((skill) => skill.name).join('، ')
                            : labels.noSkills}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!finalStatus ? (
                        <>
                          <Button
                            size="sm"
                            disabled={isBusy}
                            onClick={() => void updateStatus(application, 'accepted')}
                          >
                            {isBusy ? (
                              <LoaderCircle className="me-2 size-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="me-2 size-4" />
                            )}
                            {labels.accept}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => void updateStatus(application, 'rejected')}
                          >
                            <XCircle className="me-2 size-4" />
                            {labels.reject}
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{labels.finalStatus}</p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy || !applicant?.id}
                        onClick={() => void openConversation(application)}
                      >
                        <MessageSquare className="me-2 size-4" />
                        {labels.message}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
