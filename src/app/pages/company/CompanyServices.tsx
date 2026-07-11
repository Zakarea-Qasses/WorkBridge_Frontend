import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoaderCircle, RefreshCw, Search } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, Input } from '@/app/components/ui';
import { createReport, getServices, type Service } from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { categoryDisplayName } from '@/app/utils/categoryLabels';

export default function CompanyServices() {
  const { isEnglish, language } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setServices(await getServices());
    } catch {
      setError(isEnglish ? 'Unable to load services.' : 'تعذر تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter(
      (service) =>
        !term ||
        service.title.toLowerCase().includes(term) ||
        (service.user?.name || '').toLowerCase().includes(term),
    );
  }, [search, services]);

  const reportService = async (service: Service) => {
    try {
      setReportingId(service.id);
      setError('');
      setMessage('');
      await createReport({
        target_type: 'service',
        target_id: service.id,
        title: `بلاغ عن خدمة: ${service.title}`,
        category: 'complaint',
        priority: 'normal',
        description: `تم إرسال بلاغ على الخدمة "${service.title}" لمراجعتها من قبل الإدارة.\n\n${service.description || ''}`,
      });
      setMessage(isEnglish ? 'Report sent successfully.' : 'تم إرسال البلاغ بنجاح');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : (isEnglish ? 'Could not send report.' : 'تعذر إرسال البلاغ'));
    } finally {
      setReportingId(null);
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Provider Services' : 'خدمات مقدمي الخدمة'}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pe-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isEnglish ? 'Search services...' : 'ابحث في الخدمات...'} />
            </div>
          </CardContent>
        </Card>
        {message ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-3 text-sm text-green-700">{message}</CardContent>
          </Card>
        ) : null}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2"><div className="h-52 animate-pulse rounded-lg bg-muted" /><div className="h-52 animate-pulse rounded-lg bg-muted" /></div>
        ) : error ? (
          <Card><CardContent className="py-12 text-center"><p>{error}</p><Button className="mt-4" onClick={load}><RefreshCw className="me-2 size-4" />{isEnglish ? 'Try again' : 'إعادة المحاولة'}</Button></CardContent></Card>
        ) : visible.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{isEnglish ? 'No services are currently available.' : 'لا توجد خدمات متاحة حاليًا'}</CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((service) => (
              <Card key={service.id}>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div><h2 className="font-semibold">{service.title}</h2><p className="text-sm text-muted-foreground">{service.user?.name}</p></div>
                    {service.category ? <Badge variant="outline">{categoryDisplayName(service.category.name, isEnglish)}</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description || (isEnglish ? 'No description.' : 'لا يوجد وصف.')}</p>
                  <div className="flex gap-4 text-sm"><span>{service.price}</span><span>{service.delivery_days} {isEnglish ? 'days' : 'يوم'}</span></div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => navigate(`/services/${service.id}/request`)}>
                      {isEnglish ? 'Apply for service' : 'تقديم على الخدمة'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={reportingId === service.id}
                      onClick={() => void reportService(service)}
                    >
                      {reportingId === service.id ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                      {isEnglish ? 'Report post' : 'إبلاغ عن المنشور'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
