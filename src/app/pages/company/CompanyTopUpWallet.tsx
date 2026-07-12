import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft, ArrowRight, CreditCard, LoaderCircle, Upload, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
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
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { requestWalletDeposit } from '@/app/api/pages/company/topUpWallet';
import { parsePositiveMoney, sanitizeMoneyInput } from '@/app/utils/money';
import {
  buildWalletRequestText,
  DEFAULT_WALLET_PAYMENT_METHOD,
  WALLET_PAYMENT_METHODS,
  type WalletPaymentMethod,
} from '@/app/utils/walletPaymentMethods';

export default function CompanyTopUpWallet() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const BackIcon = isEnglish ? ArrowLeft : ArrowRight;
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<WalletPaymentMethod>(DEFAULT_WALLET_PAYMENT_METHOD);
  const [paymentNote, setPaymentNote] = useState('');
  const [depositReceipt, setDepositReceipt] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (value: string) => {
    const nextValue = sanitizeMoneyInput(value);

    if (!nextValue) {
      setAmount('');
      setError('');
      return;
    }

    if (Number(nextValue) === 0) {
      setAmount('');
      setError(isEnglish ? 'Amount cannot be zero.' : 'لا يمكن أن يكون المبلغ صفراً.');
      return;
    }

    setAmount(nextValue);
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      navigate('/company/wallet', {
        state: { walletMessage: isEnglish ? 'Deposit request sent to admin.' : 'تم إرسال طلب الشحن للأدمن.' },
      });
    } catch (requestError) {
      const validationErrors = getValidationErrors(requestError);
      const validationMessage =
        validationErrors.amount?.[0] ||
        validationErrors.deposit_proof?.[0] ||
        validationErrors.deposit_receipt?.[0];
      setError(
        validationMessage ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to send deposit request.' : 'تعذر إرسال طلب الشحن.'),
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

    navigate('/company/wallet');
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Top up company wallet' : 'إيداع في محفظة الشركة'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Send a company wallet deposit request for admin approval.'
                : 'أرسل طلب شحن محفظة الشركة ليتم مراجعته من الأدمن.'}
            </p>
          </div>
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
                ? 'The balance changes only after admin approval.'
                : 'لا يتغير الرصيد إلا بعد موافقة الأدمن.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="company-top-up-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="company-top-up-amount"
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder="$0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-payment-method">{isEnglish ? 'Payment method' : 'طريقة الإيداع'}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as WalletPaymentMethod)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="company-payment-method">
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
                <Label htmlFor="company-payment-note">{isEnglish ? 'Deposit number' : 'رقم الإيداع'}</Label>
                <Textarea
                  id="company-payment-note"
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
                <Label htmlFor="company-deposit-receipt">
                  {isEnglish ? 'Deposit receipt image' : 'صورة إيصال الإيداع'}
                </Label>
                <Input
                  id="company-deposit-receipt"
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
                      ? 'Sending request...'
                      : 'جاري إرسال الطلب...'
                    : isEnglish
                      ? 'Send deposit request'
                      : 'إرسال طلب الشحن'}
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
