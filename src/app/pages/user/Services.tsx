import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, Briefcase, Clock, RefreshCw, Search, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui';
import { getServices, type Service } from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

function formatPrice(value: number | string, isEnglish: boolean) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(isEnglish ? 'en' : 'ar', { maximumFractionDigits: 2 }).format(amount)
    : String(value || '');
}

function ServiceSkeleton() {
  return <div className="h-60 animate-pulse rounded-lg border bg-muted" />;
}

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setServices(await getServices());
    } catch {
      setServices([]);
      setError(isEnglish ? 'Unable to load services.' : 'تعذر تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const categories = useMemo(() => {
    const unique = new Map<number, string>();
    services.forEach((service) => {
      if (service.category) unique.set(service.category.id, service.category.name);
    });
    return [...unique.entries()];
  }, [services]);

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = categoryId === 'all' || String(service.category_id) === categoryId;
      const matchesSearch =
        !term ||
        service.title.toLowerCase().includes(term) ||
        (service.description || '').toLowerCase().includes(term) ||
        (service.user?.name || '').toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [categoryId, search, services]);

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Services' : 'الخدمات'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish ? 'Browse services published by real providers.' : 'تصفح الخدمات المنشورة من مقدمي الخدمات.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/services/my">{isEnglish ? 'My services' : 'خدماتي'}</Link></Button>
            <Button asChild><Link to="/services/create">{isEnglish ? 'Publish service' : 'نشر خدمة'}</Link></Button>
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pe-10" placeholder={isEnglish ? 'Search services...' : 'ابحث في الخدمات...'} />
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isEnglish ? 'All categories' : 'كل التصنيفات'}</SelectItem>
                {categories.map(([id, name]) => <SelectItem key={id} value={String(id)}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2"><ServiceSkeleton /><ServiceSkeleton /><ServiceSkeleton /><ServiceSkeleton /></div>
        ) : error ? (
          <Card><CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <p>{error}</p>
            <Button onClick={loadServices}><RefreshCw className="me-2 size-4" />{isEnglish ? 'Try again' : 'إعادة المحاولة'}</Button>
          </CardContent></Card>
        ) : filteredServices.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            {services.length === 0
              ? (isEnglish ? 'No services are currently available.' : 'لا توجد خدمات متاحة حاليًا')
              : (isEnglish ? 'No services match your search.' : 'لا توجد خدمات مطابقة للبحث.')}
          </CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{service.user?.name || (isEnglish ? 'Unknown provider' : 'مقدم خدمة غير معروف')}</p>
                    </div>
                    {service.category ? <Badge variant="outline">{service.category.name}</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{service.description || (isEnglish ? 'No description.' : 'لا يوجد وصف.')}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1"><Wallet className="size-4 text-primary" />{formatPrice(service.price, isEnglish)}</span>
                    <span className="flex items-center gap-1"><Clock className="size-4 text-primary" />{service.delivery_days} {isEnglish ? 'days' : 'يوم'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {service.user_id !== user?.id ? (
                      <Button onClick={() => navigate(`/services/${service.id}/request`)}>{isEnglish ? 'Request service' : 'طلب الخدمة'}</Button>
                    ) : (
                      <Button asChild variant="outline"><Link to="/services/my"><Briefcase className="me-2 size-4" />{isEnglish ? 'Manage service' : 'إدارة الخدمة'}</Link></Button>
                    )}
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
