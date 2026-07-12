import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, LoaderCircle, Upload, Wallet } from 'lucide-react';
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
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { requestWalletDeposit } from '@/app/api/pages/user/topUpWallet';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { parsePositiveMoney, sanitizeMoneyInput } from '@/app/utils/money';
import {
  buildWalletRequestText,
  DEFAULT_WALLET_PAYMENT_METHOD,
  WALLET_PAYMENT_METHODS,
  type WalletPaymentMethod,
} from '@/app/utils/walletPaymentMethods';

export default function TopUpWallet() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const BackIcon = isEnglish ? ArrowLeft : ArrowRight;
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<WalletPaymentMethod>(DEFAULT_WALLET_PAYMENT_METHOD);
  const [paymentNote, setPaymentNote] = useState('');
  const [depositReceipt, setDepositReceipt] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (parsedAmount === null) {
      setError(isEnglish ? 'Enter an amount greater than $0.' : 'أدخل مبلغاً أكبر من $0.');
      return;
    }

    if (!paymentNote.trim() && !depositReceipt) {
      setError(
        isEnglish
          ? 'Enter the deposit number or upload a deposit receipt image as proof.'
          : 'أدخل رقم الإيداع أو ارفع صورة إيصال الإيداع كدليل للتحويل.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await requestWalletDeposit(
        parsedAmount,
        buildWalletRequestText(paymentMethod, paymentNote, isEnglish),
        depositReceipt,
        paymentNote.trim() || null,
      );
      navigate('/wallet', {
        state: {
          walletMessage: isEnglish
            ? 'Deposit request sent to admin.'
            : 'تم إرسال طلب الشحن للأدمن.',
        },
      });
    } catch (requestError) {
      setError(
        getValidationErrors(requestError).amount?.[0] ||
          getValidationErrors(requestError).deposit_proof?.[0] ||
          getValidationErrors(requestError).deposit_receipt?.[0] ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to send deposit request.' : 'تعذر إرسال طلب الشحن'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/wallet');
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{isEnglish ? 'Deposit' : 'شحن المحفظة'}</h1>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleBack}
            aria-label={isEnglish ? 'Back' : 'رجوع'}
            title={isEnglish ? 'Back' : 'رجوع'}
          >
            <BackIcon className="h-4 w-4" />
          </Button>
          <Button asChild variant="outline" className="hidden">
            <Link to="/wallet">{isEnglish ? 'Back to wallet' : 'العودة إلى المحفظة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              {isEnglish ? 'Deposit request' : 'طلب شحن الرصيد'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="deposit-amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder="$0.00"
                  disabled={isSubmitting}
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">{isEnglish ? 'Payment method' : 'طريقة الإيداع'}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as WalletPaymentMethod)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="payment-method">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-note">
                  {isEnglish ? 'Deposit number' : 'رقم الإيداع'}
                </Label>
                <Textarea
                  id="payment-note"
                  value={paymentNote}
                  onChange={(event) => setPaymentNote(event.target.value)}
                  placeholder={
                    isEnglish
                      ? 'Deposit number or transfer reference'
                      : 'رقم الإيداع أو مرجع التحويل'
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {isEnglish
                    ? 'You must provide the deposit number, a receipt image, or both so admin can verify the transfer.'
                    : 'لازم ترسل رقم الإيداع أو صورة الإيصال أو الاثنين معاً حتى يتأكد الأدمن من التحويل.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit-receipt">{isEnglish ? 'Deposit receipt image' : 'صورة إيصال الإيداع'}</Label>
                <Input
                  id="deposit-receipt"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(event) => setDepositReceipt(event.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />
                {depositReceipt ? (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Upload className="size-3.5" />
                    {depositReceipt.name}
                  </p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                {isSubmitting
                  ? isEnglish ? 'Sending request...' : 'جاري إرسال الطلب...'
                  : isEnglish ? 'Send deposit request' : 'إرسال طلب الشحن'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
