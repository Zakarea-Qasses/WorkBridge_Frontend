import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import JobApplicationsList from '@/app/components/job-applications/JobApplicationsList';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { getMyServiceRequests, type ServiceRequest } from '@/app/api/endpoints';
import { getApiErrorMessage } from '@/app/api/client';
import { useLanguage } from '@/app/providers/LanguageProvider';

function statusLabel(status: ServiceRequest['status'], isEnglish: boolean) {
  const labels = {
    pending: isEnglish ? 'Pending' : 'قيد الانتظار',
    accepted: isEnglish ? 'Accepted' : 'مقبول',
    rejected: isEnglish ? 'Rejected' : 'مرفوض',
  };
  return labels[status];
}

function statusClasses(status: ServiceRequest['status']) {
  if (status === 'accepted') return 'border-green-200 bg-green-50 text-green-700';
  if (status === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

export default function Applications() {
  const { isEnglish, language } = useLanguage();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState('');

  useEffect(() => {
    let mounted = true;

    getMyServiceRequests()
      .then((requests) => {
        if (mounted) setServiceRequests(requests);
      })
      .catch((error) => {
        if (mounted) setServiceError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setLoadingServices(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">
            {isEnglish ? 'Applications' : 'التقديمات'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Track job applications and service requests from one place.'
              : 'تابع تقديمات الوظائف وطلبات الخدمات من مكان واحد.'}
          </p>
        </div>

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

          {loadingServices ? (
            <div className="h-40 animate-pulse rounded-md bg-muted" />
          ) : serviceError ? (
            <Card className="border-destructive/30">
              <CardContent className="py-6 text-sm text-destructive">
                {serviceError}
              </CardContent>
            </Card>
          ) : serviceRequests.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {isEnglish
                  ? 'No service requests have been sent yet.'
                  : 'لا توجد طلبات خدمات مرسلة حتى الآن.'}
              </CardContent>
            </Card>
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
                    {request.delivery_days} {isEnglish ? 'days' : 'يوم'}
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
