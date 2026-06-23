import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, Briefcase, Building, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getMyJobApplications,
  type JobApplication,
  type JobApplicationStatus,
} from '@/app/api/endpoints';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';

const statusClasses: Record<JobApplicationStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  accepted: 'border-green-200 bg-green-50 text-green-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
};

function statusLabel(status: JobApplicationStatus, isEnglish: boolean) {
  const labels: Record<JobApplicationStatus, [string, string]> = {
    pending: ['Under review', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };
  return labels[status][isEnglish ? 0 : 1];
}

function locationLabel(application: JobApplication, isEnglish: boolean) {
  const job = application.job;
  if (!job) {
    return isEnglish ? 'Job is no longer available' : 'الوظيفة لم تعد متاحة';
  }

  if (job.location_type === 'remote') {
    return isEnglish ? 'Remote' : 'عن بعد';
  }

  return [job.city?.name, job.city?.governorate?.name].filter(Boolean).join('، ') ||
    (job.location_type === 'hybrid'
      ? isEnglish ? 'Hybrid' : 'هجين'
      : isEnglish ? 'On site' : 'في مقر العمل');
}

export default function JobApplicationsList({ isEnglish }: { isEnglish: boolean }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setApplications(await getMyJobApplications());
    } catch (requestError) {
      setApplications([]);
      setError(
        getApiErrorMessage(requestError) ||
          (isEnglish
            ? 'Unable to load job applications.'
            : 'تعذر تحميل تقديمات الوظائف'),
      );
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void load()}>
            <RefreshCw className="me-2 size-4" />
            {isEnglish ? 'Try again' : 'إعادة المحاولة'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!applications.length) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
          <Briefcase className="size-10 text-muted-foreground" />
          <p className="font-medium">
            {isEnglish
              ? 'You have not applied to any job yet'
              : 'لم تتقدم إلى أي وظيفة حتى الآن'}
          </p>
          <Button asChild>
            <Link to="/jobs">{isEnglish ? 'Browse jobs' : 'تصفح الوظائف'}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => {
        const job = application.job;
        return (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Building className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg">
                      {job?.title || (isEnglish ? 'Unavailable job' : 'وظيفة غير متاحة')}
                    </CardTitle>
                    {job?.company?.company_name ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.company.company_name}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Badge variant="outline" className={statusClasses[application.status]}>
                  {statusLabel(application.status, isEnglish)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {job?.description ? (
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {job.description}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {locationLabel(application, isEnglish)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
                    dateStyle: 'medium',
                  }).format(new Date(application.created_at))}
                </span>
                {job?.salary != null ? (
                  <span>
                    {isEnglish ? 'Salary:' : 'الراتب:'} {job.salary}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
