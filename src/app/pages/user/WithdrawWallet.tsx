import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, Landmark, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui';
import { getWalletData, submitWalletWithdrawal } from '@/app/storage';

export default function WithdrawWallet() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const wallet = getWalletData();
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(isEnglish ? 'Bank account' : 'الحساب البنكي');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(isEnglish ? 'Enter a valid withdrawal amount.' : 'أدخل مبلغًا صحيحًا للسحب.');
      return;
    }

    if (parsedAmount < 500) {
      setError(isEnglish ? 'Minimum withdrawal is $500.' : 'الحد الأدنى للسحب هو $500.');
      return;
    }

    if (parsedAmount > wallet.balance.available) {
      setError(isEnglish ? 'Requested amount is greater than available balance.' : 'المبلغ المطلوب أكبر من الرصيد المتاح.');
      return;
    }

    submitWalletWithdrawal(parsedAmount, withdrawMethod);
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
      setError(isEnglish ? 'You cannot enter 0 as a withdrawal amount.' : 'لا يمكن إدخال 0 كمبلغ للسحب.');
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
            <h1 className="text-3xl font-bold">{isEnglish ? 'Withdraw Funds' : 'سحب الأموال'}</h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/wallet">{isEnglish ? 'Back to wallet' : 'العودة إلى المحفظة'}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="size-5 text-primary" />
              {isEnglish ? 'Withdrawal request' : 'طلب سحب'}
            </CardTitle>
            <CardDescription>
              {isEnglish ? 'Available balance now:' : 'الرصيد المتاح الآن:'} ${wallet.balance.available.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">{isEnglish ? 'Amount' : 'المبلغ'}</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="500"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder={isEnglish ? 'Enter withdrawal amount' : 'أدخل مبلغ السحب'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-method">{isEnglish ? 'Withdrawal method' : 'طريقة السحب'}</Label>
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger id="withdraw-method">
                    <SelectValue placeholder={isEnglish ? 'Choose withdrawal method' : 'اختر طريقة السحب'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={isEnglish ? 'Bank account' : 'الحساب البنكي'}>
                      {isEnglish ? 'Bank account' : 'الحساب البنكي'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Digital wallet' : 'المحفظة الرقمية'}>
                      {isEnglish ? 'Digital wallet' : 'المحفظة الرقمية'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Local transfer' : 'تحويل محلي'}>
                      {isEnglish ? 'Local transfer' : 'تحويل محلي'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-name">{isEnglish ? 'Account or beneficiary name' : 'اسم الحساب أو المستفيد'}</Label>
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder={isEnglish ? 'Optional' : 'اختياري'}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="gap-2">
                  <Wallet className="size-4" />
                  {isEnglish ? 'Confirm withdrawal' : 'تأكيد السحب'}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link to="/wallet">{isEnglish ? 'Cancel' : 'إلغاء'}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" />
              {isEnglish ? 'Minimum withdrawal is $500.' : 'الحد الأدنى للسحب $500.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
