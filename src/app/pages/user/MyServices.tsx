import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { getDisplayCategoryLabel, getDisplayDurationLabel, getDisplayStatusLabel } from '@/app/data';
import { deleteService, getServices, updateServiceStatus } from '@/app/storage';

export default function MyServices() {
  const { isEnglish, language } = useLanguage();
  const [services, setServices] = useState(getServices());
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setServices(getServices());
  }, []);

  const myServices = useMemo(
    () => services.filter((service) => service.providerId === 1),
    [services],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'My Services' : 'خدماتي'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish ? 'Manage the services you published as a freelancer.' : 'إدارة الخدمات التي نشرتها كمستقل.'}
            </p>
          </div>
          <Button asChild>
            <Link to="/services/create">{isEnglish ? 'Publish New Service' : 'نشر خدمة جديدة'}</Link>
          </Button>
        </div>

        {feedback && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {myServices.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                {isEnglish ? 'There are no published services yet.' : 'لا توجد خدمات منشورة بعد.'}
              </CardContent>
            </Card>
          ) : (
            myServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>{service.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getDisplayCategoryLabel(service.category, isEnglish)}
                      </p>
                    </div>
                    <Badge variant="outline">{getDisplayStatusLabel(service.status, isEnglish)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {service.price} • {getDisplayDurationLabel(service.delivery, isEnglish)} • {service.orders} {isEnglish ? 'orders' : 'طلب'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const nextStatus = service.status === 'موقوف' ? 'نشط' : 'موقوف';
                        setServices(updateServiceStatus(service.id, nextStatus));
                        setFeedback(
                          isEnglish
                            ? `The status of "${service.title}" was updated.`
                            : `تم تحديث حالة الخدمة "${service.title}".`,
                        );
                      }}
                    >
                      {service.status === 'موقوف'
                        ? isEnglish
                          ? 'Reactivate'
                          : 'إعادة التفعيل'
                        : isEnglish
                          ? 'Pause Service'
                          : 'إيقاف الخدمة'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setServices(deleteService(service.id));
                        setFeedback(
                          isEnglish
                            ? `The service "${service.title}" was deleted.`
                            : `تم حذف الخدمة "${service.title}".`,
                        );
                      }}
                    >
                      {isEnglish ? 'Delete Service' : 'حذف الخدمة'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
