import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, LoaderCircle, Wallet as WalletIcon } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import {
  Button,
  Card,
  CardContent,
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
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { getMyWallet, requestWalletWithdraw } from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { formatUsd, parsePositiveMoney, sanitizeMoneyInput } from '@/app/utils/money';
import {
  buildWalletRequestText,
  DEFAULT_WALLET_PAYMENT_METHOD,
  WALLET_PAYMENT_METHODS,
  type WalletPaymentMethod,
} from '@/app/utils/walletPaymentMethods';

function formatBalance(value: number | string | null, isEnglish: boolean) {
  if (value === null) {
    return isEnglish ? 'Balance unavailable' : 'الرصيد غير متاح';
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return isEnglish ? 'Balance unavailable' : 'الرصيد غير متاح';
  }

  return formatUsd(amount, isEnglish ? 'en' : 'ar');
}

export default function CompanyWithdrawWallet() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<WalletPaymentMethod>(DEFAULT_WALLET_PAYMENT_METHOD);
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
          setError(getApiErrorMessage(requestError) || (isEnglish ? 'Unable to load company wallet.' : 'تعذر تحميل محفظة الشركة.'));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isEnglish]);

  const handleAmountChange = (value: string) => {
    const nextValue = sanitizeMoneyInput(value);
    if (nextValue && Number(nextValue) === 0) {
      setAmount('');
      setError(isEnglish ? 'Amount cannot be zero.' : 'لا يمكن أن يكون المبلغ صفراً.');
      return;
    }
    setAmount(nextValue);
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = parsePositiveMoney(amount);
    if (parsedAmount === null || parsedAmount < 50) {
      setError(isEnglish ? 'Minimum withdrawal amount is $50.' : 'الحد الأدنى للسحب هو $50.');
      return;
    }

    if (balance !== null && parsedAmount > balance) {
      setError(isEnglish ? 'Insufficient wallet balance.' : 'رصيد المحفظة غير كاف.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await requestWalletWithdraw(parsedAmount, buildWalletRequestText(paymentMethod, '', isEnglish));
      navigate('/company/wallet', {
        state: {
          walletMessage: isEnglish ? 'Withdrawal request sent to admin.' : 'تم إرسال طلب السحب للأدمن.',
        },
      });
    } catch (requestError) {
      setError(
        getValidationErrors(requestError).amount?.[0] ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to send withdrawal request.' : 'تعذر إرسال طلب السحب.'),
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
                ? 'Send a withdrawal request for admin approval.'
                : 'أرسل طلب سحب ليتم مراجعته من الأدمن.'}
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
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder="$50.00"
                  disabled={loading || isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-withdraw-method">{isEnglish ? 'Withdrawal method' : 'طريقة السحب'}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as WalletPaymentMethod)}
                  disabled={loading || isSubmitting}
                >
                  <SelectTrigger id="company-withdraw-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WALLET_PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {isEnglish ? method.labelEn : method.labelAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  ? isEnglish ? 'Sending request...' : 'جاري إرسال الطلب...'
                  : isEnglish ? 'Send withdrawal request' : 'إرسال طلب السحب'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
