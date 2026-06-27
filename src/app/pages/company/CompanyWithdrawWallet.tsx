import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, LoaderCircle, Wallet as WalletIcon } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { getMyWallet, withdrawFromWallet } from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';

function formatBalance(value: number | string | null, isEnglish: boolean) {
  if (value === null) {
    return isEnglish ? 'Balance unavailable' : 'الرصيد غير متاح';
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return isEnglish ? 'Balance unavailable' : 'الرصيد غير متاح';
  }

  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CompanyWithdrawWallet() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getMyWallet()
      .then((wallet) => {
        if (!mounted) return;
        const parsed = Number(wallet.balance);
        setBalance(Number.isFinite(parsed) ? parsed : null);
      })
      .catch((requestError) => {
        if (mounted) {
          setError(
            getApiErrorMessage(requestError) ||
              (isEnglish ? 'Unable to load company wallet.' : 'تعذر تحميل محفظة الشركة.'),
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isEnglish]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setError(isEnglish ? 'Enter an amount of at least 1.' : 'أدخل مبلغا لا يقل عن 1.');
      return;
    }

    if (
      !window.confirm(
        isEnglish ? 'Are you sure you want to withdraw this amount?' : 'هل أنت متأكد من سحب هذا المبلغ؟',
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await withdrawFromWallet(parsedAmount);
      navigate('/company/wallet', {
        state: {
          walletMessage: isEnglish ? 'Amount withdrawn successfully.' : 'تم سحب المبلغ بنجاح.',
        },
      });
    } catch (requestError) {
      setError(
        getValidationErrors(requestError).amount?.[0] ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to complete withdrawal.' : 'تعذر تنفيذ عملية السحب.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="mx-auto max-w-2xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Withdraw from company wallet' : 'سحب من محفظة الشركة'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Withdraw from the real company wallet balance.'
                : 'اسحب من رصيد محفظة الشركة الحقيقي.'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/company/wallet">{isEnglish ? 'Back to company wallet' : 'العودة إلى محفظة الشركة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="size-5 text-primary" />
              {isEnglish ? 'Withdrawal request' : 'طلب سحب'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading
                ? isEnglish ? 'Loading balance...' : 'جاري تحميل الرصيد...'
                : `${isEnglish ? 'Current balance:' : 'الرصيد الحالي:'} ${formatBalance(balance, isEnglish)}`}
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="company-withdraw-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="company-withdraw-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError('');
                  }}
                  disabled={loading || isSubmitting}
                />
                {error ? (
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    {error}
                  </p>
                ) : null}
              </div>

              <Button type="submit" disabled={loading || isSubmitting || balance === null}>
                {isSubmitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                {isSubmitting
                  ? isEnglish ? 'Withdrawing...' : 'جاري تنفيذ عملية السحب...'
                  : isEnglish ? 'Confirm withdrawal' : 'تأكيد السحب'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
