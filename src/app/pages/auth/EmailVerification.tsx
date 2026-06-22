import { ChangeEvent, ClipboardEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Briefcase, Mail } from 'lucide-react';
import { Button, Input } from '@/app/components/ui';
import { FreshAuthLink, LanguageToggle } from '@/app/components/shared';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import * as api from '@/app/api/endpoints';
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  getStoredVerificationEmail,
} from '@/app/api/tokenStorage';
import {
  getAccountStatusPath,
  getDashboardPathForUser,
  useAuth,
} from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

const REGISTERED_ACCOUNT_KEY = 'workbridge-registered-account';
const CODE_LENGTH = 6;
const CODE_EXPIRY_SECONDS = 10 * 60;

function getRegisteredEmail() {
  if (typeof window === 'undefined') {
    return '';
  }

  window.localStorage.removeItem(REGISTERED_ACCOUNT_KEY);
  const raw = window.sessionStorage.getItem(REGISTERED_ACCOUNT_KEY);
  if (!raw) {
    return '';
  }

  try {
    const parsed = JSON.parse(raw) as { email?: string };
    return parsed.email ?? '';
  } catch {
    return '';
  }
}

function getVerificationEmail() {
  return getStoredVerificationEmail() || getStoredUser<api.WorkBridgeUser>()?.email || getRegisteredEmail();
}

function normalizeCodeValue(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '');
}

export default function EmailVerification() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [remainingSeconds, setRemainingSeconds] = useState(CODE_EXPIRY_SECONDS);
  const [statusMessage, setStatusMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setEmail(getVerificationEmail());
  }, []);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [remainingSeconds]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingSeconds]);

  const text = useMemo(
    () => ({
      title: isEnglish ? 'Check your email for a code' : 'تحقق من بريدك للحصول على الرمز',
      description: isEnglish
        ? `We sent a 6-digit code to ${email || 'your email address'}. The code expires in 10 minutes, so please enter it soon.`
        : `أرسلنا رمزا مكونا من 6 أرقام إلى ${email || 'بريدك الإلكتروني'}. تنتهي صلاحية الرمز خلال 10 دقائق، لذلك يرجى إدخاله الآن.`,
      openGmail: isEnglish ? 'Open Gmail' : 'فتح Gmail',
      openOutlook: isEnglish ? 'Open Outlook' : 'فتح Outlook',
      help: isEnglish
        ? "Can't find your code? Check your spam folder."
        : 'لم تجد الرمز؟ تحقق من مجلد الرسائل غير المرغوب فيها.',
      backToLogin: isEnglish ? 'Back to login' : 'العودة لتسجيل الدخول',
      resend: isEnglish ? 'Resend code' : 'إعادة إرسال الكود',
      resending: isEnglish ? 'Sending...' : 'جاري الإرسال...',
      resendAvailable: isEnglish
        ? 'You can request a new code now.'
        : 'يمكنك الآن طلب كود جديد.',
      resendCountdown: isEnglish
        ? `You can request a new code in ${formattedTime}.`
        : `يمكنك طلب كود جديد بعد ${formattedTime}.`,
      next: isEnglish ? 'Next' : 'التالي',
      verifying: isEnglish ? 'Verifying...' : 'جاري التحقق...',
      success: isEnglish
        ? 'Email verified successfully. Redirecting to login...'
        : 'تم تأكيد البريد الإلكتروني بنجاح. جار الانتقال إلى تسجيل الدخول...',
      resendSuccess: isEnglish
        ? 'A new verification code has been sent.'
        : 'تم إرسال كود تحقق جديد.',
      missingEmail: isEnglish
        ? 'We could not find the email address for this verification. Please register again or go back to login.'
        : 'لم نتمكن من العثور على البريد الإلكتروني لهذا التحقق. يرجى التسجيل مجددا أو العودة إلى تسجيل الدخول.',
      incompleteCode: isEnglish
        ? 'Please enter the complete 6-digit code.'
        : 'يرجى إدخال رمز التحقق المكون من 6 أرقام كاملا.',
      logoLabel: 'Work Bridge',
    }),
    [email, formattedTime, isEnglish],
  );

  const focusCodeInput = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const fillCodeFromIndex = (startIndex: number, value: string) => {
    const characters = normalizeCodeValue(value).slice(0, CODE_LENGTH - startIndex).split('');

    if (!characters.length) {
      return;
    }

    const nextCode = [...code];
    characters.forEach((character, offset) => {
      nextCode[startIndex + offset] = character;
    });
    setCode(nextCode);

    window.requestAnimationFrame(() => {
      focusCodeInput(startIndex + characters.length);
    });
  };

  const handleCodeChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    fillCodeFromIndex(index, event.target.value);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace') {
      return;
    }

    if (code[index]) {
      event.preventDefault();
      const nextCode = [...code];
      nextCode[index] = '';
      setCode(nextCode);
      return;
    }

    if (index > 0) {
      event.preventDefault();
      const nextCode = [...code];
      nextCode[index - 1] = '';
      setCode(nextCode);
      focusCodeInput(index - 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillCodeFromIndex(index, event.clipboardData.getData('text'));
  };

  const otp = code.join('');

  const handleVerifyCode = async () => {
    setStatusMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (!email) {
      setStatusMessage(text.missingEmail);
      return;
    }

    if (otp.length !== CODE_LENGTH) {
      setStatusMessage(text.incompleteCode);
      return;
    }

    try {
      setIsVerifying(true);
      await api.verifyEmail({ email, otp });
      setSuccessMessage(text.success);
      const hasToken = Boolean(getStoredToken());
      const nextUser = hasToken ? await refreshUser() : null;
      if (!hasToken) {
        clearStoredAuth();
      }
      window.setTimeout(() => {
        navigate(
          nextUser ? getAccountStatusPath(nextUser) || getDashboardPathForUser(nextUser) : '/login',
          { replace: true },
        );
      }, 1200);
    } catch (error) {
      const errors = getValidationErrors(error);
      setFieldErrors(errors);
      setStatusMessage(errors.otp?.[0] || errors.email?.[0] || 'الكود غير صحيح أو منتهي الصلاحية');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setStatusMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (remainingSeconds > 0 || isResending) {
      return;
    }

    if (!email) {
      setStatusMessage(text.missingEmail);
      return;
    }

    try {
      setIsResending(true);
      await api.resendEmailVerification({ email });
      setSuccessMessage(text.resendSuccess);
      setCode(Array(CODE_LENGTH).fill(''));
      setRemainingSeconds(CODE_EXPIRY_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white px-4 py-8 text-foreground"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <div className="mx-auto flex w-full max-w-3xl justify-end">
        <LanguageToggle />
      </div>

      <main className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-3xl flex-col items-center justify-start pt-10 text-center">
        <div className="mb-8 flex items-center gap-2 text-2xl font-bold text-primary">
          <Briefcase className="size-8" />
          <span>{text.logoLabel}</span>
        </div>

        <h1 className="text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
          {text.title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
          {text.description}
        </p>

        <form
          className="mt-8 flex w-full max-w-xl flex-col items-center"
          onSubmit={(event) => {
            event.preventDefault();
            handleVerifyCode();
          }}
        >
          <div className="flex items-center justify-center gap-3" dir="ltr">
            {code.map((value, index) => (
              <div key={index} className="flex items-center gap-3">
                {index === 3 ? <span className="text-xl text-slate-500">-</span> : null}
                <Input
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  value={value}
                  aria-label={`Code character ${index + 1}`}
                  autoFocus={index === 0}
                  inputMode="numeric"
                  maxLength={1}
                  disabled={isVerifying}
                  onChange={(event) => handleCodeChange(index, event)}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={(event) => handlePaste(index, event)}
                  className="size-16 rounded-none border-slate-400 bg-white text-center text-2xl font-semibold shadow-none focus-visible:ring-2 md:size-20"
                />
              </div>
            ))}
          </div>

          {fieldErrors.otp?.[0] ? <p className="mt-3 text-sm text-destructive">{fieldErrors.otp[0]}</p> : null}
          {fieldErrors.email?.[0] ? <p className="mt-3 text-sm text-destructive">{fieldErrors.email[0]}</p> : null}
          {statusMessage ? <p className="mt-4 text-sm text-destructive">{statusMessage}</p> : null}
          {successMessage ? <p className="mt-4 text-sm font-medium text-primary">{successMessage}</p> : null}

          <Button type="submit" className="mt-6 min-w-40" disabled={isVerifying}>
            {isVerifying ? text.verifying : text.next}
          </Button>
        </form>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm">
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-primary"
          >
            <Mail className="size-4 text-red-500" />
            {text.openGmail}
          </a>
          <a
            href="https://outlook.live.com/mail/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-primary"
          >
            <Mail className="size-4 text-blue-600" />
            {text.openOutlook}
          </a>
        </div>

        <p className="mt-5 text-sm text-slate-600">{text.help}</p>
        <p className="mt-3 text-sm font-medium text-primary">
          {remainingSeconds > 0 ? text.resendCountdown : text.resendAvailable}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={remainingSeconds > 0 || isResending}
            onClick={handleResendCode}
          >
            {isResending ? text.resending : text.resend}
          </Button>
          <Button asChild variant="ghost">
            <FreshAuthLink mode="login">{text.backToLogin}</FreshAuthLink>
          </Button>
        </div>
      </main>
    </div>
  );
}
