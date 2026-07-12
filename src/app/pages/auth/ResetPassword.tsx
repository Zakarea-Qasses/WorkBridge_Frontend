import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
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
import { LanguageToggle } from '@/app/components/shared';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { resetPassword } from '@/app/api/pages/auth/resetPassword';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isEnglish, language } = useLanguage();
  const token = searchParams.get('token') || '';
  const emailFromLink = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkIsValid = useMemo(() => Boolean(token), [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setStatusMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (!linkIsValid) {
      setStatusMessage(isEnglish ? 'Reset link is invalid.' : 'رابط إعادة التعيين غير صحيح.');
      return;
    }

    if (!email || !password || !confirmPassword) {
      setStatusMessage(isEnglish ? 'Fill in all fields.' : 'املأ جميع الحقول.');
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage(isEnglish ? 'Passwords do not match.' : 'كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccessMessage(response.message || (isEnglish ? 'Password reset successfully.' : 'تم تغيير كلمة المرور بنجاح.'));
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
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
            {isEnglish ? 'Set New Password' : 'تعيين كلمة مرور جديدة'}
          </CardTitle>
          <CardDescription>
            {isEnglish
              ? 'Enter your email and new password.'
              : 'أدخل بريدك وكلمة المرور الجديدة.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
              />
              {fieldErrors.email?.[0] ? (
                <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{isEnglish ? 'New password' : 'كلمة المرور الجديدة'}</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
              {fieldErrors.password?.[0] ? (
                <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {isEnglish ? 'Confirm password' : 'تأكيد كلمة المرور'}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
              />
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
                ? isEnglish ? 'Saving...' : 'جاري الحفظ...'
                : isEnglish ? 'Reset Password' : 'تغيير كلمة المرور'}
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
