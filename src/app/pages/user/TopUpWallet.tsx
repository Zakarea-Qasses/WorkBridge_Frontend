import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CreditCard, Landmark, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui';
import { submitWalletTopUp } from '@/app/storage';

export default function TopUpWallet() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(isEnglish ? 'Bank card' : 'بطاقة بنكية');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(isEnglish ? 'Enter a valid top-up amount.' : 'أدخل مبلغًا صحيحًا للشحن.');
      return;
    }

    submitWalletTopUp(parsedAmount, paymentMethod);
    navigate('/wallet');
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
      setError(isEnglish ? 'You cannot enter 0 as a top-up amount.' : 'لا يمكن إدخال 0 كمبلغ للشحن.');
      return;
    }

    setAmount(String(Number(digitsOnly)));
    setError('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Top Up Wallet' : 'شحن المحفظة'}</h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/wallet">{isEnglish ? 'Back to wallet' : 'العودة إلى المحفظة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              {isEnglish ? 'Add balance' : 'تعبئة الرصيد'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="top-up-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="top-up-amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder={isEnglish ? 'Enter the amount' : 'أدخل المبلغ المطلوب'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-up-method">{isEnglish ? 'Payment method' : 'طريقة الدفع'}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="top-up-method">
                    <SelectValue placeholder={isEnglish ? 'Choose payment method' : 'اختر طريقة الدفع'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={isEnglish ? 'Bank card' : 'بطاقة بنكية'}>
                      {isEnglish ? 'Bank card' : 'بطاقة بنكية'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Bank transfer' : 'تحويل بنكي'}>
                      {isEnglish ? 'Bank transfer' : 'تحويل بنكي'}
                    </SelectItem>
                    <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="top-up-reference">{isEnglish ? 'Reference' : 'مرجع العملية'}</Label>
                <Input
                  id="top-up-reference"
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
                  <Link to="/wallet">{isEnglish ? 'Cancel' : 'إلغاء'}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="size-4 text-primary" />
                {isEnglish ? 'Quick card top up' : 'شحن سريع من البطاقة'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Landmark className="size-4 text-primary" />
                {isEnglish ? 'Bank transfer' : 'تحويل بنكي'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
