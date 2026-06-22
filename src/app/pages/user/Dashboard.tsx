import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, Briefcase, RefreshCw, Star, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { ApiError } from '@/app/api/client';
import { getPersonalDashboard, PersonalDashboardResponse } from '@/app/api/endpoints';
import { getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-lg bg-muted" />
        <div className="h-44 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const { user, initializing } = useAuth();
  const [dashboard, setDashboard] = useState<PersonalDashboardResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    if (initializing || user?.role !== 'personal') {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await getPersonalDashboard();
      if (requestId !== requestIdRef.current) {
        return;
      }

      setDashboard(response);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setDashboard(null);

      if (error instanceof ApiError && error.status === 403) {
        setErrorMessage(
          isEnglish
            ? 'You do not have permission to access the personal dashboard.'
            : 'ليس لديك صلاحية للوصول إلى لوحة التحكم الشخصية',
        );
        window.setTimeout(() => {
          navigate(getDashboardPathForUser(user), { replace: true });
        }, 1200);
      } else if (error instanceof ApiError && error.status === 404) {
        setErrorMessage(
          isEnglish
            ? 'The personal dashboard is currently unavailable.'
            : 'لوحة التحكم الشخصية غير متاحة حاليًا',
        );
      } else {
        setErrorMessage(
          isEnglish
            ? 'Unable to load dashboard data.'
            : 'تعذر تحميل بيانات لوحة التحكم',
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [initializing, isEnglish, navigate, user]);

  useEffect(() => {
    loadDashboard();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDashboard]);

  const displayedUser = dashboard?.user || user;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {isLoading ? <DashboardLoading /> : null}

        {!isLoading && errorMessage ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <p className="text-lg font-medium">{errorMessage}</p>
              <Button onClick={loadDashboard}>
                <RefreshCw className="me-2 size-4" />
                {isEnglish ? 'Try again' : 'إعادة المحاولة'}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && dashboard ? (
          <>
            <div className="rounded-lg bg-gradient-to-l from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    {isEnglish
                      ? `Welcome, ${displayedUser?.name || ''}`
                      : `مرحبًا، ${displayedUser?.name || ''}`}
                  </h2>
                  <p className="text-blue-100">
                    {isEnglish
                      ? 'Your personal Work Bridge account is ready.'
                      : dashboard.message}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  title={isEnglish ? 'Refresh dashboard' : 'تحديث لوحة التحكم'}
                  aria-label={isEnglish ? 'Refresh dashboard' : 'تحديث لوحة التحكم'}
                  onClick={loadDashboard}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Quick Actions' : 'إجراءات سريعة'}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/projects">
                    <Briefcase className="size-5" />
                    {isEnglish ? 'Browse available projects' : 'تصفح المشاريع المتاحة'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/services">
                    <Star className="size-5" />
                    {isEnglish ? 'Browse services' : 'تصفح الخدمات'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/jobs">
                    <TrendingUp className="size-5" />
                    {isEnglish ? 'Find a job' : 'البحث عن وظيفة'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2">
                  <Link to="/support">
                    <AlertCircle className="size-5" />
                    {isEnglish ? 'Support center' : 'مركز الدعم'}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {isEnglish
                  ? 'Dashboard statistics and recent activity are not provided by the backend yet.'
                  : 'لا تتوفر إحصائيات أو أنشطة حديثة من الخادم حتى الآن.'}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
