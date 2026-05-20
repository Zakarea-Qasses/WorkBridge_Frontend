import { useLanguage } from '@/app/providers/LanguageProvider';

export default function AppLoader() {
  const { isEnglish, language } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 size-14 animate-pulse rounded-full bg-primary/15" />
        <h1 className="text-2xl font-bold text-foreground">
          {isEnglish ? 'Loading the interface' : 'جارٍ تحميل الواجهة'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isEnglish
            ? 'We are preparing the requested page for you now. This should only take a few moments.'
            : 'نجهز لك الصفحة المطلوبة الآن. لن يستغرق ذلك سوى لحظات.'}
        </p>
      </div>
    </div>
  );
}
