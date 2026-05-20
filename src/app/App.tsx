import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AppLoader } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { router } from '@/app/routes';

export default function App() {
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    document.documentElement.classList.remove('dark');
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = language;
    window.localStorage.removeItem('workbridge-theme');
  }, [language]);

  return (
    <Suspense fallback={<AppLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
