import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Briefcase,
  Building,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Search,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  applyToJob,
  createReport,
  getJobs,
  getMyJobApplications,
  type JobPost,
} from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';

const JOBS_PER_PAGE = 6;

function jobLocation(job: JobPost, isEnglish: boolean) {
  if (job.location_type === 'remote') return isEnglish ? 'Remote' : 'عن بعد';

  return [job.city?.name, job.city?.governorate?.name].filter(Boolean).join('، ') ||
    (job.location_type === 'hybrid'
      ? isEnglish ? 'Hybrid' : 'هجين'
      : isEnglish ? 'On site' : 'في مقر العمل');
}

export default function Jobs() {
  const { isEnglish, language } = useLanguage();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    Promise.all([getJobs(), getMyJobApplications()])
      .then(([loadedJobs, applications]) => {
        if (!mounted) return;
        setJobs(loadedJobs);
        setAppliedIds(new Set(applications.map((application) => application.job_id)));
      })
      .catch((requestError) => {
        if (!mounted) return;
        setJobs([]);
        setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return jobs;

    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.company?.company_name.toLowerCase().includes(term),
    );
  }, [jobs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const visibleJobs = filteredJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const submitApplication = async (job: JobPost) => {
    try {
      setApplyingId(job.id);
      setError('');
      setMessage('');
      await applyToJob(job.id);
      setAppliedIds((current) => new Set(current).add(job.id));
      setMessage(
        isEnglish
          ? 'Job application sent successfully.'
          : 'تم إرسال طلب التقديم بنجاح.',
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setApplyingId(null);
    }
  };

  const reportJob = async (job: JobPost) => {
    try {
      setReportingId(job.id);
      setError('');
      setMessage('');
      await createReport({
        target_type: 'job',
        target_id: job.id,
        title: `بلاغ عن وظيفة: ${job.title}`,
        category: 'complaint',
        priority: 'normal',
        description: `تم إرسال بلاغ على الوظيفة "${job.title}" لمراجعتها من قبل الإدارة.\n\n${job.description}`,
      });
      setMessage(isEnglish ? 'Report sent successfully.' : 'تم إرسال البلاغ بنجاح');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError) || (isEnglish ? 'Could not send report.' : 'تعذر إرسال البلاغ'));
    } finally {
      setReportingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Available Jobs' : 'الوظائف المتاحة'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Browse active jobs and submit a real application.'
                : 'تصفح الوظائف النشطة وأرسل طلب تقديم '}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/applied-jobs">
              {isEnglish ? 'My applications' : 'تقديماتي'}
            </Link>
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}
        {message ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-3 text-sm text-green-700">{message}</CardContent>
          </Card>
        ) : null}

        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={isEnglish ? 'Search jobs...' : 'ابحث عن وظيفة...'}
            className="pr-10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-60 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : visibleJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {isEnglish ? 'No matching jobs found.' : 'لا توجد وظائف مطابقة.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleJobs.map((job) => {
              const applied = appliedIds.has(job.id);
              return (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Building className="size-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="size-4" />
                          {job.company?.company_name ||
                            (isEnglish ? 'Company' : 'شركة')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {jobLocation(job, isEnglish)}
                      </span>
                      {job.salary != null ? (
                        <Badge variant="secondary">
                          {isEnglish ? 'Salary' : 'الراتب'}: {job.salary}
                        </Badge>
                      ) : null}
                    </div>
                    <Button
                      className="w-full"
                      disabled={applied || applyingId === job.id}
                      onClick={() => void submitApplication(job)}
                    >
                      {applyingId === job.id ? (
                        <LoaderCircle className="me-2 size-4 animate-spin" />
                      ) : applied ? (
                        <CheckCircle2 className="me-2 size-4" />
                      ) : null}
                      {applied
                        ? isEnglish ? 'Applied' : 'تم التقديم'
                        : applyingId === job.id
                          ? isEnglish ? 'Submitting...' : 'جار الإرسال...'
                          : isEnglish ? 'Apply to job' : 'التقديم إلى الوظيفة'}
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={reportingId === job.id}
                      onClick={() => void reportJob(job)}
                    >
                      {reportingId === job.id ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                      {isEnglish ? 'Report post' : 'إبلاغ عن المنشور'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              {isEnglish ? 'Previous' : 'السابق'}
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              {isEnglish ? 'Next' : 'التالي'}
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
