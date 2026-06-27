import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, CreditCard, LoaderCircle, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { depositWallet } from '@/app/api/endpoints';

export default function CompanyTopUpWallet() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');

    if (!digitsOnly) {
      setAmount('');
      setError('');
      return;
    }

    if (Number(digitsOnly) === 0) {
      setAmount('');
      setError(isEnglish ? 'You cannot enter 0 as a top-up amount.' : 'لا يمكن إدخال 0 كمبلغ للإيداع.');
      return;
    }

    setAmount(String(Number(digitsOnly)));
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(isEnglish ? 'Enter a valid amount to top up the wallet.' : 'أدخل مبلغا صحيحا لإيداعه في المحفظة.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await depositWallet(parsedAmount);
      navigate('/company/wallet', {
        state: { walletMessage: isEnglish ? 'Amount deposited successfully.' : 'تم إيداع المبلغ بنجاح.' },
      });
    } catch (requestError) {
      const validationMessage = getValidationErrors(requestError).amount?.[0];
      setError(
        validationMessage ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to top up the wallet.' : 'تعذر إيداع المبلغ في المحفظة.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Top up company wallet' : 'إيداع في محفظة الشركة'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Add balance directly to the authenticated company wallet.'
                : 'أضف رصيدا مباشرة إلى محفظة حساب الشركة المسجل.'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/company/wallet">{isEnglish ? 'Back to wallet' : 'العودة إلى المحفظة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              {isEnglish ? 'Deposit amount' : 'مبلغ الإيداع'}
            </CardTitle>
            <CardDescription>
              {isEnglish
                ? 'This action uses the backend wallet deposit endpoint and updates the company balance.'
                : 'هذه العملية مرتبطة بالباك وتحدث رصيد محفظة الشركة مباشرة.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="company-top-up-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="company-top-up-amount"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder={isEnglish ? 'Enter amount' : 'أدخل المبلغ'}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                  {isSubmitting
                    ? isEnglish
                      ? 'Depositing...'
                      : 'جار الإيداع...'
                    : isEnglish
                      ? 'Confirm deposit'
                      : 'تأكيد الإيداع'}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link to="/company/wallet">{isEnglish ? 'Cancel' : 'إلغاء'}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
