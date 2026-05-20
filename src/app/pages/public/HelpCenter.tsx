import { Link } from 'react-router';
import {
  ArrowRight,
  Briefcase,
  CircleHelp,
  FileText,
  Mail,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function HelpCenter() {
  const { isEnglish, language } = useLanguage();

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <header className="border-b border-border/70 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Briefcase className="size-7" />
            <span className="text-xl font-bold">Work Bridge</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button asChild variant="ghost">
              <Link to="/login">{isEnglish ? 'Login' : 'تسجيل الدخول'}</Link>
            </Button>
            <Button asChild>
              <Link to="/register">{isEnglish ? 'Create Account' : 'إنشاء حساب'}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-10">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl bg-primary/10 p-4">
                <CircleHelp className="size-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  {isEnglish ? 'Help & Support Center' : 'مركز الدعم والمساعدة'}
                </h1>
                <p className="max-w-3xl leading-7 text-muted-foreground">
                  {isEnglish
                    ? 'This page is public and available to everyone to explain how to contact the platform and where to find the essential information before logging in. Opening a real support ticket or following a complaint or dispute happens from inside the account after sign-in.'
                    : 'هذه الصفحة عامة ومفتوحة للجميع حتى توضّح طريقة التواصل مع المنصة، وأين تجد المعلومات الأساسية قبل تسجيل الدخول. أما فتح تذكرة دعم فعلية أو متابعة حالة شكوى أو نزاع، فيتم من داخل الحساب بعد تسجيل الدخول.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/">
                  <ArrowRight className="size-4" />
                  {isEnglish ? 'Back to Home' : 'الرجوع للواجهة الرئيسية'}
                </Link>
              </Button>
              <Button asChild>
                <Link to="/login">{isEnglish ? 'Go to Account' : 'الدخول إلى الحساب'}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <Mail className="mb-2 size-7 text-primary" />
              <CardTitle>{isEnglish ? 'Direct Contact' : 'التواصل المباشر'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>{isEnglish ? 'Email: support@workbridge.com' : 'البريد: support@workbridge.com'}</p>
              <p>{isEnglish ? 'Phone: +963 11 000 0000' : 'الهاتف: +963 11 000 0000'}</p>
              <p>{isEnglish ? 'Hours: 9 AM to 5 PM' : 'أوقات الاستجابة: من 9 صباحًا حتى 5 مساءً'}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <MessageSquare className="mb-2 size-7 text-primary" />
              <CardTitle>{isEnglish ? 'When to Use Support?' : 'متى تستخدم الدعم؟'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>{isEnglish ? 'If you face a technical issue inside your account.' : 'إذا واجهت مشكلة تقنية داخل الحساب.'}</p>
              <p>{isEnglish ? 'If you want to ask about a financial transaction or wallet balance.' : 'إذا أردت الاستفسار عن معاملة مالية أو رصيد المحفظة.'}</p>
              <p>{isEnglish ? 'If you have a dispute or complaint and need official follow-up.' : 'إذا كان عندك نزاع أو شكوى وتحتاج متابعة رسمية.'}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <ShieldCheck className="mb-2 size-7 text-primary" />
              <CardTitle>{isEnglish ? 'When Is Login Required?' : 'متى يلزم تسجيل الدخول؟'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>{isEnglish ? 'When opening a new support ticket.' : 'عند فتح تذكرة دعم جديدة.'}</p>
              <p>{isEnglish ? 'When uploading files or images related to the request.' : 'عند رفع ملفات أو صور مرتبطة بالطلب.'}</p>
              <p>{isEnglish ? 'When following the complaint or dispute status from inside the account.' : 'عند متابعة حالة الشكوى أو النزاع من داخل الحساب.'}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>{isEnglish ? 'Frequently Asked Questions' : 'أسئلة شائعة'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">
                  {isEnglish ? 'Can I browse without an account?' : 'هل يمكنني التصفح بدون حساب؟'}
                </p>
                <p>
                  {isEnglish
                    ? 'Yes. You can review the landing page and public pages such as support, terms, and privacy before creating an account.'
                    : 'نعم، يمكنك الاطلاع على الصفحة الرئيسية والصفحات العامة مثل الدعم والشروط والخصوصية قبل إنشاء الحساب.'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {isEnglish ? 'Can I send a report without logging in?' : 'هل أستطيع إرسال بلاغ بدون تسجيل؟'}
                </p>
                <p>
                  {isEnglish
                    ? 'Reports and account-linked tickets require sign-in so the request can be linked to its owner and followed correctly.'
                    : 'البلاغات والتذاكر المرتبطة بالحساب تحتاج تسجيل الدخول حتى يتم ربط الطلب بصاحبه ومتابعته بشكل صحيح.'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {isEnglish ? 'How do I follow my request later?' : 'كيف أتابع طلبي لاحقًا؟'}
                </p>
                <p>
                  {isEnglish
                    ? 'After logging in and opening the ticket, its status will appear inside the support center in your account.'
                    : 'بعد تسجيل الدخول وفتح التذكرة، ستظهر لك حالتها من داخل مركز الدعم في الحساب.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <FileText className="mb-2 size-7 text-primary" />
              <CardTitle>{isEnglish ? 'Important Links' : 'روابط مهمة'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Link to="/terms" className="block rounded-xl bg-slate-50 px-4 py-3 text-primary hover:bg-slate-100 hover:underline">
                {isEnglish ? 'Terms & Conditions' : 'الشروط والأحكام'}
              </Link>
              <Link to="/privacy" className="block rounded-xl bg-slate-50 px-4 py-3 text-primary hover:bg-slate-100 hover:underline">
                {isEnglish ? 'Privacy Policy' : 'سياسة الخصوصية'}
              </Link>
              <Link to="/register" className="block rounded-xl bg-slate-50 px-4 py-3 text-primary hover:bg-slate-100 hover:underline">
                {isEnglish ? 'Create New Account' : 'إنشاء حساب جديد'}
              </Link>
              <Link to="/login" className="block rounded-xl bg-slate-50 px-4 py-3 text-primary hover:bg-slate-100 hover:underline">
                {isEnglish ? 'Sign In to the Platform' : 'تسجيل الدخول إلى المنصة'}
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
