import { Link } from 'react-router';
import { Briefcase, Mail } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { getStoredVerificationEmail } from '@/app/api/tokenStorage';

const COMPANY_VERIFICATION_EMAIL = 'support@workbridge.com';

const statusContent = {
  pending: {
    title: 'حسابك بانتظار المراجعة',
    body: 'تم إنشاء حسابك بنجاح، لكنه يحتاج إلى مراجعة الإدارة قبل الوصول إلى لوحة التحكم.',
  },
  underReview: {
    title: 'حسابك قيد المراجعة',
    body: 'فريق الإدارة يراجع بيانات الحساب حاليا. سنخبرك عند اكتمال المراجعة.',
  },
  blocked: {
    title: 'تم حظر الحساب',
    body: 'لا يمكن لهذا الحساب الوصول إلى المنصة حاليا. يرجى التواصل مع الدعم إذا كنت تعتقد أن هذا خطأ.',
  },
  companyPending: {
    title: 'توثيق الشركة قيد الانتظار',
    body: 'لتأكيد أن الشركة مسجلة وحقيقية، أرسل الوثائق المطلوبة إلى بريد فريق التوثيق. بعد مراجعتها سيقوم الأدمن بتفعيل حساب الشركة.',
  },
};

export function AccountStatusPage({
  type,
}: {
  type: keyof typeof statusContent;
}) {
  const { language, isEnglish } = useLanguage();
  const { logout } = useAuth();
  const content = statusContent[type];
  const isCompanyPending = type === 'companyPending';
  const registeredEmail = getStoredVerificationEmail();
  const mailSubject = encodeURIComponent('طلب توثيق حساب شركة في Work Bridge');
  const mailBody = encodeURIComponent(
    `مرحبا،\n\nأرغب بتوثيق حساب الشركة في Work Bridge.\nبريد الحساب: ${registeredEmail || 'يرجى كتابة بريد الحساب هنا'}\n\nتم إرفاق الوثائق المطلوبة.`,
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted p-4"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-3 rounded-full bg-primary/10 p-4">
            <Briefcase className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isEnglish ? 'Account status' : content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="leading-7 text-muted-foreground">
            {isEnglish
              ? isCompanyPending
                ? 'Send the required company documents to our verification email. The admin will activate the company account after reviewing them.'
                : 'Your account cannot open the normal dashboard yet. Please check the account status or contact support.'
              : content.body}
          </p>

          {isCompanyPending ? (
            <div className="space-y-4 border-y border-border py-5 text-start">
              <div>
                <p className="font-semibold">
                  {isEnglish ? 'Required documents' : 'الوثائق المطلوبة'}
                </p>
                <ul className="mt-2 list-disc space-y-2 px-5 text-sm text-muted-foreground">
                  <li>{isEnglish ? 'Commercial registration or company registration certificate.' : 'السجل التجاري أو شهادة تسجيل الشركة.'}</li>
                  <li>{isEnglish ? 'Tax registration document, when applicable.' : 'وثيقة التسجيل الضريبي إن وجدت.'}</li>
                  <li>{isEnglish ? 'Proof that the account holder is authorized to represent the company.' : 'إثبات أن صاحب الحساب مخول بتمثيل الشركة.'}</li>
                </ul>
              </div>

              <div className="rounded-md bg-muted px-4 py-3 text-sm">
                <span className="font-medium">
                  {isEnglish ? 'Send documents to: ' : 'أرسل الوثائق إلى: '}
                </span>
                <a
                  className="text-primary hover:underline"
                  href={`mailto:${COMPANY_VERIFICATION_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
                >
                  {COMPANY_VERIFICATION_EMAIL}
                </a>
              </div>

              <Button asChild className="w-full">
                <a href={`mailto:${COMPANY_VERIFICATION_EMAIL}?subject=${mailSubject}&body=${mailBody}`}>
                  <Mail className="size-4" />
                  {isEnglish ? 'Email verification documents' : 'إرسال وثائق التوثيق بالبريد'}
                </a>
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/help">{isEnglish ? 'Help center' : 'مركز المساعدة'}</Link>
            </Button>
            <Button type="button" onClick={logout}>
              {isEnglish ? 'Log out' : 'تسجيل الخروج'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountPending() {
  return <AccountStatusPage type="pending" />;
}

export function AccountUnderReview() {
  return <AccountStatusPage type="underReview" />;
}

export function AccountBlocked() {
  return <AccountStatusPage type="blocked" />;
}

export function CompanyPendingVerification() {
  return <AccountStatusPage type="companyPending" />;
}
