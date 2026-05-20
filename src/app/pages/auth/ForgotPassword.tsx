import { Link } from 'react-router';
import { KeyRound } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function ForgotPassword() {
  const { isEnglish, language } = useLanguage();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between gap-3">
            <LanguageToggle />
          </div>
          <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-4">
            <KeyRound className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isEnglish ? 'Reset Password' : 'استعادة كلمة المرور'}
          </CardTitle>
          <CardDescription>
            {isEnglish
              ? 'Enter your email and we will send you a password reset link.'
              : 'أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="bg-input-background"
              />
            </div>
            <Button type="submit" className="w-full">
              {isEnglish ? 'Send Reset Link' : 'إرسال رابط الاستعادة'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              {isEnglish ? 'Back to Login' : 'العودة إلى تسجيل الدخول'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
