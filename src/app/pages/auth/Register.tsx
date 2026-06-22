import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, Mail } from 'lucide-react';
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
import { FreshAuthLink, LanguageToggle } from '@/app/components/shared';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function Register() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'company'>('personal');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companyVerificationEmail = 'support@workbridge.com';

  const handleRegister = async () => {
    setStatusMessage('');
    setFieldErrors({});

    if (!fullName || !email || !password || !confirmPassword) {
      setStatusMessage(isEnglish ? 'Please fill in all required fields.' : 'يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage(isEnglish ? 'Password and confirmation do not match.' : 'كلمة المرور وتأكيدها غير متطابقين.');
      return;
    }

    if (!acceptedTerms) {
      setStatusMessage(isEnglish ? 'You must agree to the terms and conditions first.' : 'يجب الموافقة على الشروط والأحكام أولا.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: fullName,
        email,
        password,
        password_confirmation: confirmPassword,
        role: accountType,
      });
      navigate('/verify-email');
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
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between gap-3">
            <LanguageToggle />
          </div>
          <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-4">
            <Briefcase className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{isEnglish ? 'Create Account' : 'إنشاء حساب جديد'}</CardTitle>
          <CardDescription>
            {isEnglish ? 'Join Work Bridge and start your professional journey' : 'انضم إلى Work Bridge وابدأ رحلتك المهنية'}
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
              <Input id="fullname" name="name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
              {fieldErrors.name?.[0] ? <p className="text-xs text-destructive">{fieldErrors.name[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
              <Input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              {fieldErrors.email?.[0] ? <p className="text-xs text-destructive">{fieldErrors.email[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEnglish ? 'Password' : 'كلمة المرور'}</Label>
              <Input id="password" name="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              {fieldErrors.password?.[0] ? <p className="text-xs text-destructive">{fieldErrors.password[0]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{isEnglish ? 'Confirm Password' : 'تأكيد كلمة المرور'}</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-type">{isEnglish ? 'Account Type' : 'نوع الحساب'}</Label>
              <Select value={accountType} onValueChange={(value) => setAccountType(value as 'personal' | 'company')}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{isEnglish ? 'Personal Account' : 'حساب شخصي'}</SelectItem>
                  <SelectItem value="company">{isEnglish ? 'Company' : 'شركة'}</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.role?.[0] ? <p className="text-xs text-destructive">{fieldErrors.role[0]}</p> : null}
            </div>

            {accountType === 'company' ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-start">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-amber-700" />
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-amber-950">
                        {isEnglish
                          ? 'Company verification documents are required'
                          : 'توثيق حساب الشركة يحتاج إلى وثائق'}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-900">
                        {isEnglish
                          ? 'After creating and verifying your email, send the documents below so the administration can review and activate the company account.'
                          : 'بعد إنشاء الحساب وتأكيد البريد، تواصل معنا وأرسل الوثائق التالية حتى تراجعها الإدارة وتكمل إجراءات توثيق حساب الشركة.'}
                      </p>
                    </div>

                    <ul className="list-disc space-y-1 px-5 text-sm text-amber-900">
                      <li>
                        {isEnglish
                          ? 'Commercial registration or company registration certificate.'
                          : 'السجل التجاري أو شهادة تسجيل الشركة.'}
                      </li>
                      <li>
                        {isEnglish
                          ? 'Tax registration document, when available.'
                          : 'وثيقة التسجيل الضريبي إن وجدت.'}
                      </li>
                      <li>
                        {isEnglish
                          ? 'Proof that you are authorized to represent the company.'
                          : 'إثبات أنك مخول بتمثيل الشركة.'}
                      </li>
                    </ul>

                    <p className="text-sm font-medium text-amber-950">
                      {isEnglish ? 'Send the documents to: ' : 'أرسل الوثائق إلى: '}
                      <a
                        href={`mailto:${companyVerificationEmail}?subject=${encodeURIComponent('طلب توثيق حساب شركة في Work Bridge')}`}
                        className="text-primary underline"
                      >
                        {companyVerificationEmail}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 rounded"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                {isEnglish ? 'I agree to the terms and conditions and the privacy policy' : 'أوافق على الشروط والأحكام وسياسة الخصوصية'}
              </label>
            </div>

            {statusMessage ? <p className="text-sm text-destructive">{statusMessage}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (isEnglish ? 'Creating...' : 'جار الإنشاء...') : isEnglish ? 'Create Account' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isEnglish ? 'Already have an account? ' : 'لديك حساب بالفعل؟ '}
            <FreshAuthLink mode="login" className="font-semibold text-primary hover:underline">
              {isEnglish ? 'Login' : 'تسجيل الدخول'}
            </FreshAuthLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
