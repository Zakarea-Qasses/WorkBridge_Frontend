import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LoaderCircle, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { depositWallet } from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function TopUpWallet() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setError(isEnglish ? 'Enter an amount of at least 1.' : 'أدخل مبلغاً لا يقل عن 1.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await depositWallet(parsedAmount);
      navigate('/wallet', {
        state: {
          walletMessage: isEnglish
            ? 'Wallet deposited successfully.'
            : 'تم شحن المحفظة بنجاح',
        },
      });
    } catch (requestError) {
      setError(
        getValidationErrors(requestError).amount?.[0] ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to deposit to wallet.' : 'تعذر شحن المحفظة'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{isEnglish ? 'Deposit' : 'شحن المحفظة'}</h1>
          <Button asChild variant="outline">
            <Link to="/wallet">{isEnglish ? 'Back to wallet' : 'العودة إلى المحفظة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              {isEnglish ? 'Deposit amount' : 'مبلغ الإيداع'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError('');
                  }}
                  disabled={isSubmitting}
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                {isSubmitting
                  ? isEnglish ? 'Depositing...' : 'جاري شحن المحفظة...'
                  : isEnglish ? 'Confirm deposit' : 'تأكيد الإيداع'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
