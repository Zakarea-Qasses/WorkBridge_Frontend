import { useMemo } from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { useLanguage } from '@/app/providers/LanguageProvider';

function getLocalizedErrorMessage(error: unknown, isEnglish: boolean) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return isEnglish
        ? 'The requested page could not be found or may have been moved.'
        : 'الصفحة المطلوبة غير موجودة أو تم نقلها.';
    }

    return error.statusText || (isEnglish ? 'An error occurred while loading the page.' : 'حدث خطأ أثناء تحميل الصفحة.');
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return isEnglish ? 'An unexpected error occurred inside the application.' : 'حصل خطأ غير متوقع داخل التطبيق.';
}

export default function RouteError() {
  const error = useRouteError();
  const { isEnglish, language } = useLanguage();
  const message = useMemo(() => getLocalizedErrorMessage(error, isEnglish), [error, isEnglish]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="w-full max-w-xl rounded-3xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          {isEnglish ? 'Unable to Display the Page' : 'تعذر عرض الصفحة'}
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">{message}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/">
              <Home className="ml-2 size-4" />
              {isEnglish ? 'Back to Home' : 'العودة للرئيسية'}
            </Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="ml-2 size-4" />
            {isEnglish ? 'Reload Page' : 'إعادة تحميل الصفحة'}
          </Button>
        </div>
      </div>
    </div>
  );
}
