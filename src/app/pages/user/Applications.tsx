import { useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { jobs, getDisplayDurationLabel, getDisplayStatusLabel } from '@/app/data';
import { getAppliedJobIds, getServiceRequests, removeAppliedJobId } from '@/app/storage';

function getStatusBadge(status: string) {
  switch (status) {
    case 'Accepted':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Rejected':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Postponed':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

export default function Applications() {
  const { isEnglish, language } = useLanguage();
  const [appliedJobIds, setAppliedJobIds] = useState(() => getAppliedJobIds());
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'You can track your applications here and withdraw any application you no longer want to continue.'
      : 'يمكنك متابعة تقديماتك وسحب التقديمات التي لم تعد ترغب بمتابعتها.',
  );

  const appliedJobs = useMemo(
    () => jobs.filter((job) => appliedJobIds.includes(job.id)),
    [appliedJobIds],
  );
  const serviceRequests = useMemo(
    () => getServiceRequests().filter((request) => request.clientId === 1),
    [],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Applications' : 'التقديمات'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'This section clarifies the difference between job applications and service requests instead of keeping each type isolated only.'
              : 'هذا القسم يوضح الفرق بين التقديم على الوظائف وطلبات الخدمات بدل بقاء كل نوع في صفحة منفصلة فقط.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Job Applications' : 'التقديم على الوظائف'}</CardTitle>
              <CardDescription>
                {isEnglish ? 'Represents the Job_Apply part in the structure.' : 'يمثل جزء Job_Apply في الهيكل.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {appliedJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'There are no job applications currently sent.' : 'لا توجد طلبات توظيف مرسلة حاليًا.'}
                </p>
              ) : null}
              {appliedJobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{job.location}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      {isEnglish ? 'Sent' : 'مرسل'}
                    </Badge>
                  </div>

                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAppliedJobIds(removeAppliedJobId(job.id));
                        setFeedback(
                          isEnglish
                            ? `The application for "${job.title}" was withdrawn.`
                            : `تم سحب التقديم على وظيفة "${job.title}".`,
                        );
                      }}
                    >
                      {isEnglish ? 'Withdraw application' : 'سحب التقديم'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Service Requests' : 'طلبات الخدمات'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Represents requests related to services or other published items.'
                  : 'تمثل الطلبات المرتبطة بالخدمات أو المنشورات الأخرى.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {serviceRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'There are no service requests currently sent.' : 'لا توجد طلبات خدمات مرسلة حاليًا.'}
                </p>
              ) : null}
              {serviceRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{request.requestTitle}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{request.serviceTitle}</p>
                    </div>
                    <Badge className={getStatusBadge(request.status)}>
                      {getDisplayStatusLabel(request.status, isEnglish)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {getDisplayDurationLabel(request.deadline, isEnglish)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
