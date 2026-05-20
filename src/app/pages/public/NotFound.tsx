import { Link } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function NotFound() {
  const { isEnglish, language } = useLanguage();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-6">
            <AlertCircle className="size-24 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold text-foreground">
            {isEnglish ? 'Page Not Found' : 'الصفحة غير موجودة'}
          </h2>
          <p className="mx-auto max-w-md text-xl text-muted-foreground">
            {isEnglish
              ? 'Sorry, the page you are looking for does not exist or has been moved.'
              : 'عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="size-5" />
              {isEnglish ? 'Back to Home' : 'العودة للرئيسية'}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/dashboard">{isEnglish ? 'Dashboard' : 'لوحة التحكم'}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
