import { Link } from 'react-router';
import { CheckCircle2, Mail } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function EmailVerification() {
  const { isEnglish, language } = useLanguage();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between gap-3">
            <LanguageToggle />
          </div>
          <div className="mx-auto mb-4 w-fit rounded-full bg-green-100 p-4">
            <Mail className="size-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">
            {isEnglish ? 'Verify Your Email' : 'تحقق من بريدك الإلكتروني'}
          </CardTitle>
          <CardDescription>
            {isEnglish
              ? 'A verification link has been sent to your email address.'
              : 'تم إرسال رابط التحقق إلى بريدك الإلكتروني'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg bg-muted p-6">
            <CheckCircle2 className="mx-auto size-12 text-green-600" />
            <p className="text-sm text-muted-foreground">
              {isEnglish
                ? 'Please check your inbox and click the verification link to activate your account.'
                : 'يرجى التحقق من صندوق الوارد الخاص بك والنقر على رابط التحقق لتفعيل حسابك'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEnglish ? "Didn't receive the email?" : 'لم تستلم الرسالة؟'}
          </p>
          <Button variant="outline" className="w-full">
            {isEnglish ? 'Resend Verification Link' : 'إعادة إرسال رابط التحقق'}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">{isEnglish ? 'Back to Login' : 'العودة لتسجيل الدخول'}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
