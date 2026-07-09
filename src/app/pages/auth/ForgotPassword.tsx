import { FormEvent, useState } from 'react';
import { CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react';
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
import { FreshAuthLink, LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { forgotPassword } from '@/app/api/endpoints';

export default function ForgotPassword() {
  const { isEnglish, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setStatusMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (!email.trim()) {
      setStatusMessage(isEnglish ? 'Enter your email address.' : 'أدخل بريدك الإلكتروني.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forgotPassword({ email: email.trim() });
      setSuccessMessage(
        response.message ||
          (isEnglish
            ? 'If this email is registered, a reset link has been sent.'
            : 'إذا كان البريد مسجلاً لدينا، سيتم إرسال رابط إعادة التعيين.'),
      );
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatusMessage('');
                  setSuccessMessage('');
                  setFieldErrors({});
                }}
                placeholder="example@email.com"
                className="bg-input-background"
                disabled={isSubmitting}
              />
              {fieldErrors.email?.[0] ? (
                <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
              ) : null}
            </div>

            {successMessage ? (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="size-4" />
                {successMessage}
              </div>
            ) : null}

            {statusMessage ? <p className="text-sm text-destructive">{statusMessage}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
              {isSubmitting
                ? isEnglish ? 'Sending...' : 'جاري الإرسال...'
                : isEnglish ? 'Send Reset Link' : 'إرسال رابط الاستعادة'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <FreshAuthLink mode="login" className="text-sm text-primary hover:underline">
              {isEnglish ? 'Back to Login' : 'العودة إلى تسجيل الدخول'}
            </FreshAuthLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
