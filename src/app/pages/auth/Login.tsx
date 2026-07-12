import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Briefcase } from 'lucide-react';
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
import { ApiError, getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  clearStoredVerificationEmail,
  clearStoredVerificationRole,
  getStoredVerificationRole,
  setStoredVerificationEmail,
} from '@/app/api/tokenStorage';
import { getAccountStatusPath, getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function Login() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setStatusMessage('');
    setFieldErrors({});

    if (!email || !password) {
      setStatusMessage(isEnglish ? 'Please enter your email and password.' : 'يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login({ email, password });
      clearStoredVerificationEmail();
      clearStoredVerificationRole();
      navigate(getAccountStatusPath(user) || getDashboardPathForUser(user), { replace: true });
    } catch (error) {
      setFieldErrors(getValidationErrors(error));

      if (error instanceof ApiError && error.status === 403) {
        const message = error.message.toLowerCase();
        setStoredVerificationEmail(email);

        if (message.includes('تأكيد البريد') || message.includes('verify')) {
          navigate('/verify-email', { replace: true });
          return;
        }

        if (message.includes('تحت المراجعة') || message.includes('under review')) {
          navigate('/account-under-review', { replace: true });
          return;
        }

        if (message.includes('بانتظار مراجعة') || message.includes('pending')) {
          navigate(
            getStoredVerificationRole() === 'company'
              ? '/company-pending-verification'
              : '/account-pending',
            { replace: true },
          );
          return;
        }

        if (message.includes('حظر') || message.includes('blocked')) {
          navigate('/account-blocked', { replace: true });
          return;
        }
      }

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
            <Briefcase className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{isEnglish ? 'Login' : 'تسجيل الدخول'}</CardTitle>
          <CardDescription>
            {isEnglish ? 'Welcome back to Work Bridge' : 'مرحبا بك في Work Bridge'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            autoComplete="off"
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                className="bg-input-background"
              />
              {fieldErrors.email?.[0] ? (
                <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEnglish ? 'Password' : 'كلمة المرور'}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="bg-input-background"
              />
              {fieldErrors.password?.[0] ? (
                <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {isEnglish ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
              </Link>
            </div>

            {statusMessage ? <p className="text-sm text-destructive">{statusMessage}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (isEnglish ? 'Logging in...' : 'جار تسجيل الدخول...') : isEnglish ? 'Login' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isEnglish ? "Don't have an account? " : 'ليس لديك حساب؟ '}
            <FreshAuthLink mode="register" className="font-semibold text-primary hover:underline">
              {isEnglish ? 'Create one now' : 'إنشاء حساب جديد'}
            </FreshAuthLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
