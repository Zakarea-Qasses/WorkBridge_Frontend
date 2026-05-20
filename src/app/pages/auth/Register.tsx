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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';

const REGISTERED_ACCOUNT_KEY = 'workbridge-registered-account';

export default function Register() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('personal');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setStatusMessage(
        isEnglish ? 'Please fill in all required fields.' : 'يرجى تعبئة جميع الحقول المطلوبة.',
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

    if (password !== confirmPassword) {
      setStatusMessage(
        isEnglish
          ? 'Password and confirmation do not match.'
          : 'كلمة المرور وتأكيدها غير متطابقين.',
      );
      return;
    }

    if (!acceptedTerms) {
      setStatusMessage(
        isEnglish
          ? 'You must agree to the terms and conditions first.'
          : 'يجب الموافقة على الشروط والأحكام أولًا.',
      );
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        REGISTERED_ACCOUNT_KEY,
        JSON.stringify({
          fullName,
          email,
          accountType,
        }),
      );
    }

    navigate('/verify-email');
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
          <CardTitle className="text-2xl">{isEnglish ? 'Create Account' : 'إنشاء حساب جديد'}</CardTitle>
          <CardDescription>
            {isEnglish
              ? 'Join Work Bridge and start your professional journey'
              : 'انضم إلى Work Bridge وابدأ رحلتك المهنية'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleRegister();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="fullname">{isEnglish ? 'Full Name' : 'الاسم الكامل'}</Label>
              <Input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder={isEnglish ? 'Enter your full name' : 'أدخل اسمك الكامل'}
                className="bg-input-background"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {isEnglish ? 'Confirm Password' : 'تأكيد كلمة المرور'}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="bg-input-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-type">{isEnglish ? 'Account Type' : 'نوع الحساب'}</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Choose account type' : 'اختر نوع الحساب'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{isEnglish ? 'Personal Account' : 'حساب شخصي'}</SelectItem>
                  <SelectItem value="company">{isEnglish ? 'Company' : 'شركة'}</SelectItem>
                  <SelectItem value="admin">{isEnglish ? 'Admin' : 'أدمن'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 rounded"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'I agree to the terms and conditions and the privacy policy'
                  : 'أوافق على الشروط والأحكام وسياسة الخصوصية'}
              </label>
            </div>

            {statusMessage ? <p className="text-sm text-destructive">{statusMessage}</p> : null}

            <Button type="submit" className="w-full">
              {isEnglish ? 'Create Account' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isEnglish ? 'Already have an account? ' : 'لديك حساب بالفعل؟ '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {isEnglish ? 'Login' : 'تسجيل الدخول'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
