import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Briefcase, Building, Calendar, CheckCircle2, MapPin, Trash2 } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { getDisplayRelativeTimeLabel } from '@/app/data';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { jobs } from '@/app/data';
import { getAppliedJobIds, setAppliedJobIds } from '@/app/storage';

export default function AppliedJobs() {
  const { isEnglish, language } = useLanguage();
  const [appliedJobIds, setAppliedIdsState] = useState<number[]>([]);

  useEffect(() => {
    setAppliedIdsState(getAppliedJobIds());
  }, []);

  const appliedJobs = useMemo(
    () => jobs.filter((job) => appliedJobIds.includes(job.id)),
    [appliedJobIds],
  );

  const handleCancelApplication = (jobId: number) => {
    const nextIds = appliedJobIds.filter((id) => id !== jobId);
    setAppliedIdsState(nextIds);
    setAppliedJobIds(nextIds);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Applied Jobs' : 'الوظائف التي قدمت عليها'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Track your job applications or cancel one if needed.'
                : 'هنا يمكنك متابعة طلبات التوظيف أو إلغاء التقديم'}
            </p>
          </div>
          <Button asChild>
            <Link to="/jobs">{isEnglish ? 'Back to jobs' : 'العودة إلى الوظائف'}</Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {isEnglish ? 'Current applications count:' : 'عدد الطلبات الحالية:'} {appliedJobs.length}
        </div>

        {appliedJobs.length > 0 ? (
          <div className="grid gap-6">
            {appliedJobs.map((job) => (
              <Card key={job.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building className="size-8 text-primary" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="size-3 ml-1" />
                            {isEnglish ? 'Applied' : 'تم التقديم'}
                          </Badge>
                        </div>
                        <CardDescription className="mb-2 flex items-center gap-2">
                          <Briefcase className="size-4" />
                          {job.company}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            {getDisplayRelativeTimeLabel(job.postedTime, isEnglish)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">{job.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {job.requirements.map((requirement) => (
                      <Badge key={requirement} variant="outline">
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="font-semibold text-primary">{job.salary}</div>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleCancelApplication(job.id)}
                    >
                      <Trash2 className="size-4" />
                      {isEnglish ? 'Cancel application' : 'إلغاء التقديم'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-lg font-medium">{isEnglish ? 'You have not applied to any job yet' : 'لم تقدم على أي وظيفة بعد'}</p>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'Go to the jobs page and start applying to opportunities that match you.'
                  : 'اذهب إلى صفحة الوظائف وابدأ بالتقديم على الفرص المناسبة لك.'}
              </p>
              <Button asChild className="mt-4">
                <Link to="/jobs">{isEnglish ? 'Browse jobs' : 'استعراض الوظائف'}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
