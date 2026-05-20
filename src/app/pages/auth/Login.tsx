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
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

const REGISTERED_ACCOUNT_KEY = 'workbridge-registered-account';

export default function Login() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setStatusMessage(
        isEnglish
          ? 'Please enter your email and password.'
          : 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
      );
      return;
    }

    if (password.length < 8) {
      setStatusMessage(
        isEnglish
          ? 'Password must be at least 8 characters or digits.'
          : 'يجب أن تكون كلمة المرور 8 أحرف أو أرقام على الأقل.',
      );
      return;
    }

    let accountType = 'personal';

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(REGISTERED_ACCOUNT_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { accountType?: string };
          accountType = parsed.accountType || 'personal';
        } catch {
          accountType = 'personal';
        }
      }
    }

    if (accountType === 'admin') {
      navigate('/admin');
      return;
    }

    if (accountType === 'company') {
      navigate('/company-dashboard');
      return;
    }

    navigate('/dashboard');
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
            {isEnglish ? 'Welcome back to Work Bridge' : 'مرحبًا بك في Work Bridge'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEnglish ? 'Password' : 'كلمة المرور'}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="bg-input-background"
              />
              <p className="text-xs text-muted-foreground">
                {isEnglish ? 'Minimum 8 characters or digits.' : 'الحد الأدنى 8 أحرف أو أرقام.'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded" />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  {isEnglish ? 'Remember me' : 'تذكرني'}
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {isEnglish ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
              </Link>
            </div>

            {statusMessage ? <p className="text-sm text-destructive">{statusMessage}</p> : null}

            <Button type="submit" className="w-full">
              {isEnglish ? 'Login' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isEnglish ? "Don't have an account? " : 'ليس لديك حساب؟ '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              {isEnglish ? 'Create one now' : 'إنشاء حساب جديد'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
