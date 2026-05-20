import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Bookmark, Briefcase, Building, DollarSign, MapPin, Trash2 } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { getDisplayRelativeTimeLabel } from '@/app/data';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { jobs } from '@/app/data';
import { getSavedJobIds, setSavedJobIds } from '@/app/storage';

export default function SavedJobs() {
  const { isEnglish, language } = useLanguage();
  const [savedJobIds, setSavedJobIdsState] = useState<number[]>([]);

  useEffect(() => {
    setSavedJobIdsState(getSavedJobIds());
  }, []);

  const savedJobs = useMemo(
    () => jobs.filter((job) => savedJobIds.includes(job.id)),
    [savedJobIds],
  );

  const handleRemoveSavedJob = (jobId: number) => {
    const nextIds = savedJobIds.filter((id) => id !== jobId);
    setSavedJobIdsState(nextIds);
    setSavedJobIds(nextIds);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Saved Jobs' : 'الوظائف المحفوظة'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Here you can find every job you saved to revisit later or remove from saved jobs.'
                : 'هنا تجد كل الوظائف التي حفظتها لتعود إليها لاحقًا أو تزيلها من المحفوظات.'}
            </p>
          </div>
          <Button asChild>
            <Link to="/jobs">{isEnglish ? 'Back to jobs' : 'العودة إلى الوظائف'}</Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {isEnglish ? 'Saved jobs count:' : 'عدد الوظائف المحفوظة:'} {savedJobs.length}
        </div>

        {savedJobs.length > 0 ? (
          <div className="grid gap-6">
            {savedJobs.map((job) => (
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
                          <Badge className="bg-amber-500 text-white">
                            <Bookmark className="size-3 ml-1" />
                            {isEnglish ? 'Saved' : 'محفوظة'}
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
                            <DollarSign className="size-4" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {getDisplayRelativeTimeLabel(job.postedTime, isEnglish)}
                    </span>
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
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleRemoveSavedJob(job.id)}
                    >
                      <Trash2 className="size-4" />
                      {isEnglish ? 'Remove from saved' : 'إزالة من المحفوظات'}
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/jobs">{isEnglish ? 'Go to jobs' : 'الذهاب إلى الوظائف'}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-lg font-medium">{isEnglish ? 'No saved jobs yet' : 'لا توجد وظائف محفوظة بعد'}</p>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'Save jobs from the jobs page to see them here.'
                  : 'احفظ الوظائف التي تهمك من صفحة الوظائف حتى تظهر هنا.'}
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
