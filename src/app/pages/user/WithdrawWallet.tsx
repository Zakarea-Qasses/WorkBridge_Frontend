import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, LoaderCircle, Wallet as WalletIcon } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { getMyWallet, withdrawFromWallet } from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function WithdrawWallet() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
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
        if (mounted) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setError(isEnglish ? 'Enter an amount of at least 1.' : 'أدخل مبلغاً لا يقل عن 1.');
      return;
    }

    if (!window.confirm(
      isEnglish
        ? 'Are you sure you want to withdraw this amount?'
        : 'هل أنت متأكد من سحب هذا المبلغ؟',
    )) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await withdrawFromWallet(parsedAmount);
      navigate('/wallet', {
        state: {
          walletMessage: isEnglish
            ? 'Amount withdrawn successfully.'
            : 'تم سحب المبلغ بنجاح',
        },
      });
    } catch (requestError) {
      setError(
        getValidationErrors(requestError).amount?.[0] ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to complete withdrawal.' : 'تعذر تنفيذ عملية السحب'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{isEnglish ? 'Withdrawal' : 'سحب الأموال'}</h1>
          <Button asChild variant="outline">
            <Link to="/wallet">{isEnglish ? 'Back to wallet' : 'العودة إلى المحفظة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="size-5 text-primary" />
              {isEnglish ? 'Withdraw from wallet' : 'السحب من المحفظة'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading
                ? isEnglish ? 'Loading balance...' : 'جاري تحميل الرصيد...'
                : balance === null
                  ? isEnglish ? 'Balance unavailable' : 'الرصيد غير متاح'
                  : `${isEnglish ? 'Current balance:' : 'الرصيد الحالي:'} ${balance.toFixed(2)}`}
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="withdraw-amount"
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
