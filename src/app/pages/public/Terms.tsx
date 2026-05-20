import { Link } from 'react-router';
import { Briefcase, FileText } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function Terms() {
  const { isEnglish, language } = useLanguage();

  const sections = isEnglish
    ? [
        ['1. Platform Use', 'By using Work Bridge, you agree to use it only for legitimate professional purposes and not to publish misleading, abusive, or prohibited content.'],
        ['2. Accounts and Responsibility', 'Users are responsible for the accuracy of the information they add to their accounts and for keeping their login credentials private.'],
        ['3. Content and Listings', 'The platform has the right to review or suspend any violating, abusive, or unlawful content.'],
        ['4. Payments and Transactions', 'Financial operations inside the platform are subject to verification and review procedures to protect usage safety.'],
        ['5. Disputes and Reports', 'Users may submit complaints or reports when needed, and the admin may review the case and make an appropriate decision.'],
        ['6. Updates', 'These terms may be updated from time to time. Continuing to use the platform means acceptance of the latest version.'],
      ]
    : [
        ['1. استخدام المنصة', 'باستخدامك لمنصة Work Bridge فإنك توافق على استعمالها لأغراض مهنية مشروعة فقط، وعدم نشر أو إرسال أي محتوى مضلل أو مسيء أو مخالف للأنظمة.'],
        ['2. الحسابات والمسؤولية', 'المستخدم مسؤول عن صحة البيانات التي يضيفها إلى حسابه، وعن المحافظة على سرية بيانات الدخول وعدم مشاركتها مع أطراف أخرى.'],
        ['3. المحتوى والمنشورات', 'تحتفظ المنصة بحق مراجعة أو إيقاف أي محتوى مخالف أو مسيء أو غير قانوني.'],
        ['4. المدفوعات والتعاملات', 'أي عمليات مالية داخل المنصة تخضع لإجراءات التحقق والمراجعة بما يضمن سلامة الاستخدام.'],
        ['5. النزاعات والبلاغات', 'يمكن للمستخدم تقديم شكوى أو بلاغ عند الحاجة، ويحق للإدارة مراجعة الحالة واتخاذ القرار المناسب.'],
        ['6. التعديلات', 'قد يتم تحديث هذه الشروط من وقت لآخر، ويعد استمرارك في استخدام المنصة موافقة على النسخة الأحدث.'],
      ];

  return (
    <div className="min-h-screen bg-slate-50" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <header className="border-b border-border bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Briefcase className="size-7" />
            <span className="text-xl font-bold">Work Bridge</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button asChild variant="outline">
              <Link to="/">{isEnglish ? 'Back to Home' : 'العودة للرئيسية'}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <div className="mb-3 flex items-center gap-3">
              <FileText className="size-8 text-primary" />
              <CardTitle className="text-3xl">{isEnglish ? 'Terms & Conditions' : 'الشروط والأحكام'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
            {sections.map(([title, body]) => (
              <section key={title}>
                <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
                <p>{body}</p>
              </section>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
