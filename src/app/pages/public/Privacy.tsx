import { Link } from 'react-router';
import { Briefcase, Shield } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function Privacy() {
  const { isEnglish, language } = useLanguage();

  const sections = isEnglish
    ? [
        ['1. Data We Collect', 'The platform may collect basic information such as name, email, profile data, and content added in posts, messages, or support requests.'],
        ['2. How Data Is Used', 'Data is used to improve the experience, manage accounts, process reports, provide support, and secure platform operations.'],
        ['3. Messages and Attachments', 'Messages and attachments may only be reviewed when there is a report, dispute, or legal/security requirement.'],
        ['4. Protection and Safety', 'The platform takes reasonable measures to protect data, while users remain responsible for protecting their passwords.'],
        ['5. Data Sharing', 'Personal data is not shared except as required by the service itself or by legal and operational obligations.'],
        ['6. Policy Updates', 'The privacy policy may be updated when the platform evolves or procedures change.'],
      ]
    : [
        ['1. البيانات التي نجمعها', 'قد تجمع المنصة بيانات أساسية مثل الاسم والبريد الإلكتروني وبيانات الملف الشخصي والمحتوى الذي تضيفه داخل المنشورات أو الرسائل أو طلبات الدعم.'],
        ['2. استخدام البيانات', 'تُستخدم البيانات لتحسين التجربة، إدارة الحسابات، ومعالجة البلاغات والدعم، وتأمين العمليات داخل المنصة.'],
        ['3. الرسائل والمرفقات', 'قد تُراجع الرسائل والمرفقات فقط عند وجود بلاغ أو نزاع أو التزام قانوني أو أمني.'],
        ['4. الحماية والأمان', 'تتخذ المنصة إجراءات معقولة لحماية البيانات، مع بقاء مسؤولية كلمة المرور على المستخدم.'],
        ['5. مشاركة البيانات', 'لا تتم مشاركة البيانات الشخصية إلا ضمن ما تقتضيه الخدمة أو المتطلبات القانونية أو إجراءات المراجعة.'],
        ['6. تحديث السياسة', 'قد يتم تحديث سياسة الخصوصية عند تطوير المنصة أو تغيير الإجراءات المعتمدة.'],
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
              <Shield className="size-8 text-primary" />
              <CardTitle className="text-3xl">{isEnglish ? 'Privacy Policy' : 'سياسة الخصوصية'}</CardTitle>
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
