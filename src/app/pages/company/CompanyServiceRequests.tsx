import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  LoaderCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { ApiError, getApiErrorMessage } from '@/app/api/client';
import {
  getMyServiceRequestsPage,
  type PaginatedResponse,
  type ServiceRequest,
} from '@/app/api/pages/company/serviceRequests';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { formatUsd } from '@/app/utils/money';

function statusLabel(status: ServiceRequest['status'], isEnglish: boolean) {
  const labels: Record<ServiceRequest['status'], [string, string]> = {
    pending: ['Pending', 'قيد المراجعة'],
    accepted: ['Accepted', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status;
}

function statusClasses(status: ServiceRequest['status']) {
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

function formatPrice(value: number | string | null | undefined, isEnglish: boolean) {
  if (value === null || value === undefined || value === '') {
    return isEnglish ? 'Price not set' : 'لم يتم تحديد السعر';
  }

  return formatUsd(value, isEnglish ? 'en' : 'ar');
}

function getLoadErrorMessage(error: unknown, isEnglish: boolean) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return isEnglish
        ? 'You are not allowed to view service requests.'
        : 'ليس لديك صلاحية لعرض طلبات الخدمات';
    }
    if (error.status === 404) {
      return isEnglish ? 'Service requests were not found.' : 'طلبات الخدمات غير موجودة.';
    }
    if (error.status >= 500) {
      return isEnglish
        ? 'Could not load service requests.'
        : 'تعذر تحميل طلبات الخدمات';
    }
  }

  return getApiErrorMessage(error);
}

export default function CompanyServiceRequests() {
  const { isEnglish, language } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const requestIdRef = useRef(0);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<ServiceRequest> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const successMessage =
    typeof location.state === 'object' &&
    location.state !== null &&
    'message' in location.state &&
    typeof location.state.message === 'string'
      ? location.state.message
      : '';

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError('');
    setRequests([]);

    try {
      const response = await getMyServiceRequestsPage(page);
      if (requestIdRef.current !== requestId) {
        return;
      }

      setPagination(response);
      setRequests(response.data);
    } catch (loadError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setPagination(null);
      setRequests([]);
      setError(getLoadErrorMessage(loadError, isEnglish));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [isEnglish, page]);

  useEffect(() => {
    requestIdRef.current += 1;
    setRequests([]);
    setPagination(null);
    setPage(1);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const canGoPrevious = Boolean(pagination && pagination.current_page > 1);
  const canGoNext = Boolean(pagination && pagination.current_page < pagination.last_page);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Sent Service Requests' : 'طلبات الخدمات المرسلة'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Track the service requests your company has sent.'
                : 'تابع طلبات الخدمات التي أرسلتها الشركة.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void load()}>
            {loading ? (
              <LoaderCircle className="me-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="me-2 size-4" />
            )}
            {isEnglish ? 'Refresh' : 'إعادة المحاولة'}
          </Button>
        </div>

        {successMessage ? (
          <Card className="border-green-200 bg-green-50 text-green-800">
            <CardContent className="flex items-center gap-2 py-3 text-sm">
              <CheckCircle2 className="size-4" />
              {successMessage}
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? 'Loading service requests...'
                : 'جاري تحميل طلبات الخدمات...'}
            </p>
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/30">
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-4 text-center text-destructive">
              <AlertTriangle className="size-10" />
              <p>{error}</p>
              <Button variant="outline" onClick={() => void load()}>
                <RefreshCw className="me-2 size-4" />
                {isEnglish ? 'Try again' : 'إعادة المحاولة'}
              </Button>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center text-muted-foreground">
              <Search className="size-10" />
              <div>
                <p className="font-medium text-foreground">
                  {isEnglish
                    ? 'No service requests have been sent yet.'
                    : 'لم تقم بإرسال أي طلبات خدمات حتى الآن'}
                </p>
                <p className="mt-1 text-sm">
                  {isEnglish
                    ? 'Browse services and send your first request.'
                    : 'استعرض الخدمات وأرسل أول طلب عند الحاجة.'}
                </p>
              </div>
              <Button asChild>
                <Link to="/company/services">
                  {isEnglish ? 'Browse services' : 'استعراض الخدمات'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const service = request.service;
              const provider = service?.user;

              return (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle>{request.title}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service?.title || (isEnglish ? 'Service unavailable' : 'الخدمة غير متاحة')}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusClasses(request.status)}>
                        {statusLabel(request.status, isEnglish)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {request.description ||
                        (isEnglish ? 'No message attached.' : 'لا توجد رسالة مرفقة')}
                    </p>

                    <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isEnglish ? 'Provider' : 'مقدم الخدمة'}
                        </p>
                        <p className="font-medium">
                          {provider?.name ||
                            (isEnglish ? 'Provider unavailable' : 'مقدم الخدمة غير متاح')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isEnglish ? 'Service price' : 'سعر الخدمة'}
                        </p>
                        <p className="font-medium">{formatPrice(service?.price, isEnglish)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isEnglish ? 'Requested delivery' : 'مدة التنفيذ المطلوبة'}
                        </p>
                        <p className="flex items-center gap-1 font-medium">
                          <Clock className="size-4 text-primary" />
                          {request.delivery_days
                            ? `${request.delivery_days} ${isEnglish ? 'days' : 'يوم'}`
                            : isEnglish
                              ? 'Delivery time not set'
                              : 'لم يتم تحديد مدة التنفيذ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isEnglish ? 'Sent at' : 'تاريخ الإرسال'}
                        </p>
                        <p className="flex items-center gap-1 font-medium">
                          <Calendar className="size-4 text-primary" />
                          {formatDate(request.created_at, isEnglish)}
                        </p>
                      </div>
                    </div>

                    {request.references ? (
                      <div className="rounded-md border bg-muted/40 p-3 text-sm">
                        <p className="mb-1 text-xs text-muted-foreground">
                          {isEnglish ? 'References' : 'روابط أو مراجع'}
                        </p>
                        <p className="whitespace-pre-wrap">{request.references}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}

            {pagination && pagination.last_page > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'Page' : 'الصفحة'} {pagination.current_page} / {pagination.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!canGoPrevious || loading}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    {isEnglish ? 'Previous' : 'السابق'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canGoNext || loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {isEnglish ? 'Next' : 'التالي'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
