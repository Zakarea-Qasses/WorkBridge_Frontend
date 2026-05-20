import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CreditCard, Landmark, Wallet } from 'lucide-react';
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
} from '@/app/components/ui';
import { submitWalletTopUp } from '@/app/storage';

export default function CompanyTopUpWallet() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(
    isEnglish ? 'Corporate bank transfer' : 'تحويل بنكي للشركة',
  );
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(
        isEnglish
          ? 'Enter a valid amount to top up the wallet.'
          : 'أدخل مبلغًا صحيحًا لشحن المحفظة.',
      );
      return;
    }

    submitWalletTopUp(parsedAmount, paymentMethod, 'company');
    navigate('/company/wallet');
  };

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');

    if (!digitsOnly) {
      setAmount('');
      setError('');
      return;
    }

    if (Number(digitsOnly) === 0) {
      setAmount('');
      setError(
        isEnglish
          ? 'You cannot enter 0 as a top-up amount.'
          : 'لا يمكن إدخال 0 كمبلغ لإضافة الرصيد.',
      );
      return;
    }

    setAmount(String(Number(digitsOnly)));
    setError('');
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Top up company wallet' : 'إضافة رصيد إلى محفظة الشركة'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Add balance to the company wallet from a dedicated standalone screen.'
                : 'أضف رصيدًا إلى محفظة الشركة من خلال واجهة مستقلة ومخصصة.'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/company/wallet">
              {isEnglish ? 'Back to company wallet' : 'العودة إلى محفظة الشركة'}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              {isEnglish ? 'Top up balance' : 'تعبئة الرصيد'}
            </CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Once confirmed, the balance will be added directly to the company wallet inside the interface.'
                : 'بعد التأكيد سيُضاف الرصيد مباشرة إلى محفظة الشركة داخل الواجهة.'}
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
                  placeholder={isEnglish ? 'Enter the requested amount' : 'أدخل المبلغ المطلوب'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-top-up-method">
                  {isEnglish ? 'Payment method' : 'طريقة الدفع'}
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="company-top-up-method">
                    <SelectValue placeholder={isEnglish ? 'Select payment method' : 'اختر طريقة الدفع'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={isEnglish ? 'Corporate bank transfer' : 'تحويل بنكي للشركة'}>
                      {isEnglish ? 'Corporate bank transfer' : 'تحويل بنكي للشركة'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Corporate bank card' : 'بطاقة بنكية للشركة'}>
                      {isEnglish ? 'Corporate bank card' : 'بطاقة بنكية للشركة'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Corporate online payment' : 'دفع إلكتروني للشركة'}>
                      {isEnglish ? 'Corporate online payment' : 'دفع إلكتروني للشركة'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-top-up-reference">
                  {isEnglish ? 'Transaction reference' : 'مرجع العملية'}
                </Label>
                <Input
                  id="company-top-up-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder={isEnglish ? 'Optional' : 'اختياري'}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="gap-2">
                  <CreditCard className="size-4" />
                  {isEnglish ? 'Confirm top up' : 'تأكيد الشحن'}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link to="/company/wallet">{isEnglish ? 'Cancel' : 'إلغاء'}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="size-4 text-primary" />
                {isEnglish ? 'Quick top up using corporate payment methods' : 'شحن سريع بوسائل دفع الشركة'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Landmark className="size-4 text-primary" />
                {isEnglish
                  ? 'Bank transfer dedicated to company accounts'
                  : 'تحويل بنكي مخصص لحسابات الشركات'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'This screen is a frontend demo and uses company wallet data only.'
                  : 'هذه الواجهة تجريبية من جهة الفرونت، وتستخدم بيانات محفظة الشركة فقط.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
